import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

interface GeoGebraEmbedProps {
  angleDeg?: number;
  labels?: boolean;
  width?: number;
  height?: number;
}

/**
 * buildAngle — draws two rays from the origin with an arc marking the angle.
 *
 * Creates:
 *   A = (2; 0°)          — point on the first ray
 *   B = (0, 0)           — vertex (origin)
 *   C = (2; angleDeg°)   — point on the second ray
 *   α = Angle(A, B, C)   — arc + value label
 *   ray1 = Ray(B, A)     — first ray
 *   ray2 = Ray(B, C)     — second ray
 *
 * All point and ray labels are hidden; only the angle value is shown.
 */
export function buildAngle(api: any, angleDeg: number, labels: boolean = false): void {
  api.evalCommand('A = (2; 0deg)');
  api.evalCommand('B = (0, 0)');
  api.evalCommand(`C = (2; ${angleDeg}deg)`);
  api.evalCommand('alpha = Angle(A, B, C)');
  api.evalCommand('ray1 = Ray(B, A)');
  api.evalCommand('ray2 = Ray(B, C)');

  // Hide point and ray labels unless explicitly requested
  if (!labels) {
    ['A', 'B', 'C', 'ray1', 'ray2'].forEach((name) => api.setLabelVisible(name, false));
  }

  // Always display the angle value (not the name)
  api.setLabelVisible('alpha', true);
  api.setLabelStyle('alpha', 2); // GeoGebra value-only label style
}

let instanceCounter = 0;

const GeoGebraEmbed: React.FC<GeoGebraEmbedProps> = ({
  angleDeg,
  labels = false,
  width = 400,
  height = 350,
}) => {
  const containerId = useRef<string>(`ggb-container-${++instanceCounter}`);
  const appletRef = useRef<any>(null);

  useEffect(() => {
    const initApplet = () => {
      const params = {
        appName: 'geometry',
        width,
        height,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        enableRightClick: false,
        enableLabelDrags: false,
        appletOnLoad: (api: any) => {
          if (angleDeg !== undefined) {
            buildAngle(api, angleDeg, labels);
          }
        },
      };
      appletRef.current = new window.GGBApplet(params, true);
      appletRef.current.inject(containerId.current);
    };

    if (window.GGBApplet) {
      initApplet();
      return;
    }

    // Load the GeoGebra deployment script once
    if (!document.querySelector('script[data-ggb]')) {
      const script = document.createElement('script');
      script.src = 'https://www.geogebra.org/apps/deployggb.js';
      script.async = true;
      script.dataset.ggb = 'true';
      script.onload = initApplet;
      document.body.appendChild(script);
    } else {
      // Script tag already exists but not yet loaded — poll briefly
      const interval = setInterval(() => {
        if (window.GGBApplet) {
          clearInterval(interval);
          initApplet();
        }
      }, 100);
    }
  }, [angleDeg, labels, width, height]);

  return <div id={containerId.current} />;
};

export default GeoGebraEmbed;
