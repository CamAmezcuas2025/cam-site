import React from "react";

interface ClassCardProps {
  name: string;
  image: string;
}

const ClassCard: React.FC<ClassCardProps> = ({ name, image }) => {
  return (
    <div className="class-card">
      <img src={image} alt={name} className="class-image" />
      <div className="class-overlay">
        <h3>{name}</h3>
      </div>
    </div>
  );
};

export default ClassCard;