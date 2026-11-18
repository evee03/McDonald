import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useT } from '../../i18n';

type ScrollThumb = {
  height: number;
  offset: number;
  canScroll: boolean;
};

type AllergensScrollbarProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  contentElement?: 'main' | 'div';
};

export const AllergensScrollbar: React.FC<AllergensScrollbarProps> = ({
  children,
  className = '',
  contentClassName = '',
  contentElement = 'main',
}) => {
  const t = useT();
  const contentRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const scrollableRef = useRef(false);
  const [thumb, setThumb] = useState<ScrollThumb>({ height: 0, offset: 0, canScroll: false });

  const updateThumb = useCallback(() => {
    const content = contentRef.current;
    const track = trackRef.current;
    if (!content || !track) return;

    const maxScroll = content.scrollHeight - content.clientHeight;
    const trackHeight = track.clientHeight;
    if (maxScroll <= 0) {
      if (scrollableRef.current) {
        if (hideTimerRef.current === null) {
          hideTimerRef.current = window.setTimeout(() => {
            hideTimerRef.current = null;
            const latestMaxScroll = content.scrollHeight - content.clientHeight;
            if (latestMaxScroll <= 0) {
              scrollableRef.current = false;
              setThumb({ height: track.clientHeight, offset: 0, canScroll: false });
            } else {
              updateThumb();
            }
          }, 80);
        }
      } else {
        setThumb({ height: trackHeight, offset: 0, canScroll: false });
      }
      return;
    }
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    scrollableRef.current = true;
    if (trackHeight <= 0) {
      setThumb((previous) => ({ ...previous, canScroll: true }));
      return;
    }

    const height = Math.max(34, (content.clientHeight / content.scrollHeight) * trackHeight);
    setThumb({
      height,
      offset: (content.scrollTop / maxScroll) * (trackHeight - height),
      canScroll: true,
    });
  }, []);

  useLayoutEffect(() => {
    updateThumb();
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(updateThumb);
    observer.observe(content);
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(updateThumb);
    });
    mutationObserver.observe(content, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateThumb, thumb.canScroll]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return undefined;

    content.addEventListener('scroll', updateThumb, { passive: true });
    return () => {
      content.removeEventListener('scroll', updateThumb);
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    };
  }, [updateThumb]);

  const scrollBy = (direction: -1 | 1) => {
    const content = contentRef.current;
    if (!content) return;
    content.scrollBy({
      top: direction * Math.max(56, content.clientHeight * 0.72),
      behavior: 'smooth',
    });
  };

  const handleThumbPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const content = contentRef.current;
    const track = trackRef.current;
    if (!content || !track || !thumb.canScroll) return;

    event.preventDefault();
    const startY = event.clientY;
    const startScrollTop = content.scrollTop;
    const scrollRange = content.scrollHeight - content.clientHeight;
    const thumbRange = track.clientHeight - thumb.height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (thumbRange <= 0) return;
      content.scrollTop = startScrollTop + ((moveEvent.clientY - startY) / thumbRange) * scrollRange;
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  };

  const ContentElement = contentElement;

  return (
    <div className={`allergens-scroll-shell ${className}`.trim()}>
      <ContentElement
        ref={(element: HTMLElement | null) => {
          contentRef.current = element;
        }}
        className={`allergens-scroll-body ${contentClassName}`.trim()}
      >
        {children}
      </ContentElement>
      <aside
        className={`allergens-custom-scrollbar${thumb.canScroll ? '' : ' is-hidden'}`}
        aria-label={t('Przewijanie treści')}
      >
        <button
          type="button"
          className="allergens-scroll-arrow allergens-scroll-arrow-up"
          aria-label={t('Przewiń w górę')}
          onClick={() => scrollBy(-1)}
        />
        <div ref={trackRef} className="allergens-scroll-track">
          <div
            className="allergens-scroll-thumb"
            style={{ height: thumb.height, transform: `translateY(${thumb.offset}px)` }}
            onPointerDown={handleThumbPointerDown}
          />
        </div>
        <button
          type="button"
          className="allergens-scroll-arrow allergens-scroll-arrow-down"
          aria-label={t('Przewiń w dół')}
          onClick={() => scrollBy(1)}
        />
      </aside>
    </div>
  );
};
