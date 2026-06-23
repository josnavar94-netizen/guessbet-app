'use client';

import { useEffect } from 'react';

export default function OrientationLock() {
  useEffect(() => {
    const orientation: any = (screen as any).orientation;
    orientation?.lock?.('portrait')?.catch(() => {});
  }, []);
  return null;
}
