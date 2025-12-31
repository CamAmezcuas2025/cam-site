"use client";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "¿Dónde está ubicado C.A.M Amezcuas?",
    answer: "Estamos ubicados en Santa Fe, Tijuana, Baja California. Ofrecemos clases de artes marciales en una de las mejores zonas de la ciudad."
  },
  {
    question: "¿Cuánto cuesta la mensualidad?",
    answer: "Nuestras mensualidades tienen un costo de $900 pesos, más $400 pesos de inscripción única. ¡Acceso ilimitado a todas nuestras clases!"
  },
  {
    question: "¿Qué clases de artes marciales ofrecen?",
    answer: "Ofrecemos Boxeo, MMA, Kickboxing, Jiu Jitsu Brasileño, Limalama, Karate Kombat, Karate Kids, Yoga Fit y Gym Funcional. Clases para todos los niveles."
  },
  {
    question: "¿Tienen clases para niños?",
    answer: "Sí, tenemos clases de Karate Kids especialmente diseñadas para niños. Es una excelente forma de desarrollar disciplina, confianza y habilidades físicas."
  },
  {
    question: "¿Cuál es el horario de clases?",
    answer: "Abrimos de lunes a viernes de 6:00 AM a 10:00 PM, y sábados de 8:00 AM a 2:00 PM. Contamos con múltiples horarios para adaptarnos a tu agenda."
  },
  {
    question: "¿Necesito experiencia previa en artes marciales?",
    answer: "No, aceptamos estudiantes de todos los niveles, desde principiantes hasta avanzados. Nuestros instructores te guiarán paso a paso."
  },
  {
    question: "¿Qué equipo necesito para comenzar?",
    answer: "Para las primeras clases solo necesitas ropa deportiva cómoda. Posteriormente, te orientaremos sobre el equipo específico según la disciplina que elijas."
  },
  {
    question: "¿Ofrecen clases de prueba?",
    answer: "Sí, puedes tomar una clase de prueba para conocer nuestras instalaciones y entrenar con nosotros antes de inscribirte."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-4 max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12 text-red-600">
        Preguntas Frecuentes
      </h2>
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-800 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white pr-4">
                {faq.question}
              </h3>
              <span className="text-red-600 text-2xl flex-shrink-0">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div className="p-4 pt-0 text-gray-300 border-t border-gray-700">
                <p className="mt-2">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
