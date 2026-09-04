"use client";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { Group } from "three";
import { MathUtils } from "three";
const dayCells = [
    [-0.98, 0.58], [-0.32, 0.58], [0.34, 0.58], [1, 0.58],
    [-0.98, -0.08], [-0.32, -0.08], [0.34, -0.08], [1, -0.08],
    [-0.98, -0.74], [-0.32, -0.74], [0.34, -0.74], [1, -0.74],
] as const;
function ClinicalAppointmentObject({ reduceMotion }: {
    reduceMotion: boolean;
}) {
    const group = useRef<Group>(null);
    const ringRef = useRef<Group>(null);
    useFrame(({ clock, pointer }, delta) => {
        if (!group.current || reduceMotion)
            return;
        const targetX = -0.12 + pointer.y * 0.1;
        const targetY = -0.32 + pointer.x * 0.16;
        group.current.rotation.x = MathUtils.damp(group.current.rotation.x, targetX, 3.5, delta);
        group.current.rotation.y = MathUtils.damp(group.current.rotation.y, targetY, 3.5, delta);
        group.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.09;
        if (ringRef.current) {
            ringRef.current.rotation.z += delta * 0.4;
            ringRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.2;
        }
    });
    return (<group ref={group} rotation={[-0.12, -0.32, 0.04]}>

      <RoundedBox args={[3.5, 4.3, 0.3]} radius={0.18} smoothness={5} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1}/>
      </RoundedBox>


      <RoundedBox args={[3.05, 0.76, 0.12]} radius={0.09} smoothness={4} position={[0, 1.52, 0.2]}>
        <meshStandardMaterial color="#1d4ed8" roughness={0.4} metalness={0.2}/>
      </RoundedBox>


      <group position={[-1.15, 1.52, 0.3]}>
        <mesh>
          <boxGeometry args={[0.07, 0.24, 0.04]}/>
          <meshStandardMaterial color="#ffffff" emissive="#dbeafe" emissiveIntensity={0.3}/>
        </mesh>
        <mesh>
          <boxGeometry args={[0.24, 0.07, 0.04]}/>
          <meshStandardMaterial color="#ffffff" emissive="#dbeafe" emissiveIntensity={0.3}/>
        </mesh>
      </group>


      {[0, 1].map((item) => (<mesh key={item} position={[-0.45 + item * 0.4, 1.52, 0.28]}>
          <boxGeometry args={[0.28, 0.06, 0.02]}/>
          <meshStandardMaterial color="#dbeafe" roughness={0.4}/>
        </mesh>))}


      {dayCells.map(([x, y], index) => {
            const isLive = index === 6;
            const isAvailable = index === 2 || index === 9;
            return (<RoundedBox key={`${x}-${y}`} args={[0.44, 0.44, 0.08]} radius={0.07} smoothness={3} position={[x, y, 0.2]}>
            <meshStandardMaterial color={isLive ? "#10b981" : isAvailable ? "#2563eb" : "#e2e8f0"} roughness={isLive ? 0.2 : 0.6} emissive={isLive ? "#059669" : "#000000"} emissiveIntensity={isLive ? 0.6 : 0}/>
          </RoundedBox>);
        })}


      <group ref={ringRef} position={[1.4, -1.1, 0.4]}>
        <mesh>
          <torusGeometry args={[0.65, 0.025, 16, 64]}/>
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.5} roughness={0.3}/>
        </mesh>
        <mesh position={[0.65, 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]}/>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8}/>
        </mesh>
      </group>


      <group position={[-1.5, -1.35, 0.45]} rotation={[Math.PI / 2, 0, 0.1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.46, 0.46, 0.16, 48]}/>
          <meshStandardMaterial color="#1d4ed8" roughness={0.3} metalness={0.4}/>
        </mesh>
        <mesh position={[0, -0.09, 0]}>
          <torusGeometry args={[0.28, 0.03, 16, 48]}/>
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2}/>
        </mesh>
      </group>
    </group>);
}
export default function AppointmentScene() {
    const reduceMotion = Boolean(useReducedMotion());
    return (<div className="h-full min-h-[430px] w-full" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.1, 7], fov: 36 }} shadows="basic" frameloop={reduceMotion ? "demand" : "always"} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={2.2}/>
        <directionalLight position={[4, 6, 5]} intensity={3.5} color="#ffffff" castShadow/>
        <directionalLight position={[-4, -1, 3]} intensity={1.5} color="#bfdbfe"/>
        <directionalLight position={[0, -3, 2]} intensity={0.8} color="#e0f2fe"/>
        <ClinicalAppointmentObject reduceMotion={reduceMotion}/>
        <ContactShadows position={[0, -2.5, 0]} opacity={0.35} scale={7.5} blur={2.5} far={5} color="#0b1329"/>
      </Canvas>
    </div>);
}
