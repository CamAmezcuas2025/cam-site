"use client";

import Image from "next/image";
import React from "react";

interface ClassCardProps {
  name: string;
  image: string;
}

const ClassCard: React.FC<ClassCardProps> = ({ name, image }) => {
  return (
    <div className="class-card">
      <Image
        src={image}
        alt={name}
        width={600}       // safe default
        height={600}
        className="class-image"
      />
      <div className="class-overlay">
        <h3>{name}</h3>
      </div>
    </div>
  );
};

export default ClassCard;
