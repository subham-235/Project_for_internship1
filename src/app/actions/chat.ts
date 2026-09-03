"use server";

import Groq from "groq-sdk";

import {
  SCHEDULA_CHAT_SYSTEM_INSTRUCTION,
} from "@/lib/chat-system-instruction";

import type {
  ChatTurn,
} from "@/types/chat";


const MAX_HISTORY_TURNS =
  12;

const MAX_MESSAGE_LENGTH =
  1200;


/* =========================================
   CLEAN CHAT TURN
========================================= */

function cleanTurn(
  turn: ChatTurn
): ChatTurn | null {

  if (
    (
      turn.role !== "user" &&
      turn.role !== "assistant"
    ) ||
    typeof turn.content !== "string"
  ) {
    return null;
  }


  const content =
    turn.content
      .trim()
      .slice(
        0,
        MAX_MESSAGE_LENGTH
      );


  return content
    ? {
        role:
          turn.role,

        content,
      }
    : null;
}


/* =========================================
   ASK SCHEDULA ASSISTANT
========================================= */

export async function askSchedulaAssistant(
  history: ChatTurn[],
  message: string
) {

  /* =======================================
     ENVIRONMENT VARIABLES
  ======================================= */

  const apiKey =
    process.env.GROQ_API_KEY;


  const model =
    process.env.GROQ_MODEL ||
    "openai/gpt-oss-120b";


  /* =======================================
     CLEAN USER MESSAGE
  ======================================= */

  const question =
    message
      .trim()
      .slice(
        0,
        MAX_MESSAGE_LENGTH
      );


  if (
    !question
  ) {
    return {
      ok:
        false as const,

      error:
        "Please enter a question.",
    };
  }


  /* =======================================
     API KEY VALIDATION
  ======================================= */

  if (
    !apiKey ||
    apiKey ===
      "YOUR_GROQ_API_KEY_HERE"
  ) {
    return {
      ok:
        false as const,

      error:
        "The chatbot is not configured yet. Add GROQ_API_KEY to .env.local and restart the development server.",
    };
  }


  /* =======================================
     CLEAN HISTORY
  ======================================= */

  const safeHistory =
    history
      .slice(
        -MAX_HISTORY_TURNS
      )
      .map(
        cleanTurn
      )
      .filter(
        (
          turn
        ): turn is ChatTurn =>
          Boolean(
            turn
          )
      );


  /* =======================================
     GROQ CLIENT
  ======================================= */

  const groq =
    new Groq({
      apiKey,
    });


  try {

    /* =====================================
       GENERATE RESPONSE
    ===================================== */

    const response =
      await groq.chat.completions.create({

        model,


        messages: [

          /* SYSTEM PROMPT */

          {
            role:
              "system",

            content:
              SCHEDULA_CHAT_SYSTEM_INSTRUCTION,
          },


          /* CHAT HISTORY */

          ...safeHistory.map(
            (
              turn
            ) => ({

              role:
                turn.role ===
                "assistant"
                  ? "assistant" as const
                  : "user" as const,

              content:
                turn.content,

            })
          ),


          /* CURRENT USER MESSAGE */

          {
            role:
              "user",

            content:
              question,
          },

        ],


        /*
          Low temperature is good
          for a healthcare assistant.

          Makes responses more
          predictable and grounded.
        */

        temperature:
          0.25,


        /*
          Groq recommends
          max_completion_tokens.

          max_tokens is deprecated.
        */

        max_completion_tokens:
          650,


        /*
          We only want one answer.
        */

        n:
          1,


        /*
          Do not stream because
          your current frontend
          expects one final response.
        */

        stream:
          false,
      });


    /* =====================================
       EXTRACT ANSWER
    ===================================== */

    const answer =
      response
        .choices?.[0]
        ?.message
        ?.content
        ?.trim();


    if (
      !answer
    ) {
      throw new Error(
        "Groq returned an empty response."
      );
    }


    /* =====================================
       SUCCESS
    ===================================== */

    return {
      ok:
        true as const,

      answer,
    };

  } catch (
    error
  ) {

    console.error(
      "Schedula Groq request failed:",
      error
    );


    return {
      ok:
        false as const,

      error:
        "The care assistant is temporarily unavailable. Please try again in a moment.",
    };
  }
}