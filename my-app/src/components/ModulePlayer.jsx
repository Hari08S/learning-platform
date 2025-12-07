// src/components/ModulePlayer.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useHeartbeat from '../hooks/useHeartbeat';

export default function ModulePlayer({ /* any props */ }) {
  const { id: courseId, moduleId } = useParams();

  // start heartbeat while the module is mounted
  // intervalSec: how often to send (15 seconds is reasonable).
  useHeartbeat({ courseId, enabled: true, intervalSec: 15 });

  useEffect(() => {
    // optional: focus the video/player etc.
  }, [courseId, moduleId]);

  return (
    <div style={{ padding: 18 }}>
      <h2>Module {moduleId}</h2>
      <p>Course: {courseId}</p>

      {/* Your lesson player (video, text, slides)... */}
      <div style={{ marginTop: 12 }}>
        {/* Example video tag (if you have one) */}
        {/* <video src={videoUrl} controls /> */}
      </div>
    </div>
  );
}
