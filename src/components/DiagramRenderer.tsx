import React from 'react';
import GeoGebraEmbed from './GeoGebraEmbed';

interface DiagramRendererProps {
  description: string;
}

/** Returns true when description mentions "angle" AND contains at least one digit. */
function isAngleDiagram(description: string): boolean {
  return /angle/i.test(description) && /\d/.test(description);
}

/**
 * Extracts the first numeric value associated with an angle reference.
 * Matches patterns like "45°", "45 degrees", "angle of 45", "45 angle".
 * Falls back to the first standalone number in the string.
 */
function extractAngleDeg(description: string): number {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:°|deg(?:ree)?s?)/i,
    /angle\s+of\s+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)[- ]angle/i,
    /(\d+(?:\.\d+)?)/,
  ];
  for (const re of patterns) {
    const m = description.match(re);
    if (m) return parseFloat(m[1]);
  }
  return 45; // safe default
}

/**
 * DiagramRenderer — picks the right renderer for a diagram description.
 *
 * Priority chain:
 *   1. GeoGebraEmbed  — when description contains "angle" + a number
 *   2. Text fallback  — raw description string
 */
const DiagramRenderer: React.FC<DiagramRendererProps> = ({ description }) => {
  if (isAngleDiagram(description)) {
    const angleDeg = extractAngleDeg(description);
    return <GeoGebraEmbed angleDeg={angleDeg} />;
  }

  // Text fallback
  return <p className="diagram-text text-sm text-gray-700">{description}</p>;
};

export default DiagramRenderer;
