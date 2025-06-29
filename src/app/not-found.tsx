"use client";

import { Suspense } from "react";

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h1>404</h1>
        <p>This page could not be found.</p>
      </div>
    </Suspense>
  );
} 