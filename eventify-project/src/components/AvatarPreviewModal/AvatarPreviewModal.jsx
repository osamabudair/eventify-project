import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './AvatarPreviewModal.css';

const VIEWPORT_SIZE = 240;

const AvatarPreviewModal = ({ isOpen, imageSrc, onClose, onSave }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // High performance refs (zero React re-renders during mousemove/drag)
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1.0);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const activePointersRef = useRef(new Map());
  const pinchStartDistRef = useRef(null);
  const pinchStartScaleRef = useRef(1.0);
  const rafIdRef = useRef(null);
  const imageDimsRef = useRef({ nw: 1, nh: 1, baseScale: 1 });

  // Update transform via hardware acceleration
  const applyTransform = () => {
    if (!imgRef.current) return;
    const { x, y } = panRef.current;
    const scale = scaleRef.current;
    imgRef.current.style.setProperty('--x', `${x}px`);
    imgRef.current.style.setProperty('--y', `${y}px`);
    imgRef.current.style.setProperty('--scale', `${scale}`);
  };

  const scheduleUpdate = () => {
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      applyTransform();
      rafIdRef.current = null;
    });
  };

  // Keep image within the circular viewport
  const clampPan = () => {
    const { nw, nh, baseScale } = imageDimsRef.current;
    const scale = scaleRef.current;
    const effW = nw * baseScale * scale;
    const effH = nh * baseScale * scale;

    const maxPanX = Math.max(0, (effW - VIEWPORT_SIZE) / 2);
    const maxPanY = Math.max(0, (effH - VIEWPORT_SIZE) / 2);

    panRef.current.x = Math.max(-maxPanX, Math.min(maxPanX, panRef.current.x));
    panRef.current.y = Math.max(-maxPanY, Math.min(maxPanY, panRef.current.y));
  };

  // Reset states on modal open and compute initial dimensions
  useEffect(() => {
    if (isOpen && imageSrc) {
      panRef.current = { x: 0, y: 0 };
      scaleRef.current = 1.0;
      activePointersRef.current.clear();
      pinchStartDistRef.current = null;

      const img = new Image();
      img.onload = () => {
        const nw = img.naturalWidth || img.width || 1;
        const nh = img.naturalHeight || img.height || 1;
        const baseScale = Math.max(VIEWPORT_SIZE / nw, VIEWPORT_SIZE / nh);
        imageDimsRef.current = { nw, nh, baseScale };
        applyTransform();
      };
      img.src = imageSrc;

      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      };
    }
  }, [isOpen, imageSrc, onClose]);

  // Non-passive wheel listener for smooth desktop scroll-to-zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isOpen) return;

    const onWheel = (e) => {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.0018;
      const nextScale = Math.min(3.0, Math.max(1.0, scaleRef.current + zoomDelta));
      scaleRef.current = nextScale;
      clampPan();
      scheduleUpdate();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [isOpen]);

  if (!isOpen || !imageSrc) return null;

  // Pointer Down (Mouse, Touch, Pen)
  const handlePointerDown = (e) => {
    const el = containerRef.current;
    if (el) {
      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      setIsDragging(true);
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...panRef.current };
    } else if (activePointersRef.current.size === 2) {
      // Initialize pinch distance
      const [p1, p2] = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = scaleRef.current;
    }
  };

  // Pointer Move (Mouse/Touch Drag)
  const handlePointerMove = (e) => {
    if (!activePointersRef.current.has(e.pointerId)) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1 && isDragging) {
      const dx = e.clientX - pointerStartRef.current.x;
      const dy = e.clientY - pointerStartRef.current.y;

      panRef.current = {
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy
      };

      clampPan();
      scheduleUpdate();
    } else if (activePointersRef.current.size === 2 && pinchStartDistRef.current) {
      // Mobile pinch-to-zoom calculation
      const [p1, p2] = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const ratio = currentDist / pinchStartDistRef.current;
      const nextScale = Math.min(3.0, Math.max(1.0, pinchStartScaleRef.current * ratio));
      scaleRef.current = nextScale;

      clampPan();
      scheduleUpdate();
    }
  };

  // Pointer Up / Cancel
  const handlePointerUp = (e) => {
    activePointersRef.current.delete(e.pointerId);

    const el = containerRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    if (activePointersRef.current.size === 0) {
      setIsDragging(false);
      pinchStartDistRef.current = null;
    } else if (activePointersRef.current.size === 1) {
      // Re-anchor single finger drag if coming back from pinch
      const remaining = Array.from(activePointersRef.current.values())[0];
      pointerStartRef.current = { x: remaining.x, y: remaining.y };
      panStartRef.current = { ...panRef.current };
      pinchStartDistRef.current = null;
    }
  };

  // Apply & Save Cropped Result
  const handleSave = () => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.onload = () => {
        const outSize = 360;
        const canvas = document.createElement('canvas');
        canvas.width = outSize;
        canvas.height = outSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          onSave(imageSrc);
          setIsProcessing(false);
          return;
        }

        const nw = img.naturalWidth || img.width || 1;
        const nh = img.naturalHeight || img.height || 1;
        const baseScale = Math.max(VIEWPORT_SIZE / nw, VIEWPORT_SIZE / nh);

        const currentPan = panRef.current;
        const currentScale = scaleRef.current;
        const ratio = outSize / VIEWPORT_SIZE;

        // Position & Scale exact match with circular viewport
        ctx.translate(outSize / 2, outSize / 2);
        ctx.translate(currentPan.x * ratio, currentPan.y * ratio);
        ctx.scale(baseScale * currentScale * ratio, baseScale * currentScale * ratio);
        ctx.drawImage(img, -nw / 2, -nh / 2, nw, nh);

        const finalUrl = canvas.toDataURL('image/jpeg', 0.92);
        onSave(finalUrl);
        setIsProcessing(false);
      };
      img.onerror = () => {
        onSave(imageSrc);
        setIsProcessing(false);
      };
      img.src = imageSrc;
    } catch {
      onSave(imageSrc);
      setIsProcessing(false);
    }
  };

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-modal-header">
          <h3 className="avatar-modal-title">Adjust Profile Picture</h3>
          <button className="avatar-modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="avatar-modal-body">
          {/* Circular 240px x 240px Viewport */}
          <div
            ref={containerRef}
            className={`avatar-circular-viewport ${isDragging ? 'is-dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Avatar preview"
              className="avatar-viewport-img"
            />
          </div>

          <p className="avatar-drag-hint">Drag to reposition • Scroll to zoom</p>
        </div>

        {/* Center-Aligned Action Buttons */}
        <div className="avatar-modal-actions">
          <button
            type="button"
            className="avatar-btn-cancel"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="avatar-btn-save"
            onClick={handleSave}
            disabled={isProcessing}
          >
            {isProcessing ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPreviewModal;
