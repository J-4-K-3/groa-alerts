import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiExternalLink, FiX } from 'react-icons/fi';

const NewsReaderPopup = ({ article, isOpen, onClose }) => {
  if (!isOpen || !article) return null;

  const articleUrl = article.url || '#';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6, 10, 18, 0.82)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 12000,
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: '92vh',
          background: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '1.25rem',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.4rem',
              }}
            >
              {article.source || 'G.R.O.A REPORT'}
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(1.5rem, 2vw, 2.2rem)',
                lineHeight: 1.2,
                color: 'var(--text-primary)',
              }}
            >
              {article.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-primary)',
              borderRadius: '999px',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Close article"
          >
            <FiX size={18} />
          </button>
        </div>

        <div
          style={{
            padding: '1.25rem 1.5rem 2rem',
            height: 'calc(92vh - 84px)',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.9rem',
              marginBottom: '1.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.92rem',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <FiClock /> {article.date || 'Today'}
            </span>

            {article.url && article.url !== '#' && (
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-color)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Open source <FiExternalLink />
              </a>
            )}
          </div>

                    <div
            style={{
              fontSize: '1.02rem',
              lineHeight: '1.9',
              color: 'var(--text-primary)',
              maxWidth: '920px',
            }}
          >
            <p style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {article.summary || article.description || 'No summary available.'}
            </p>

            <div
              style={{
                whiteSpace: 'pre-line',
                color: 'var(--text-primary)',
              }}
            >
              {article.fullText ||
                article.content ||
                article.description ||
                article.summary ||
                'No full report available.'}
            </div>
          </div>

          {article.sources && article.sources.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <div
                style={{
                  marginBottom: '0.8rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}
              >
                Sources
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {article.sources.map((source) => (
                  <span
                    key={`${article.id}-${source}`}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '999px',
                      padding: '0.45rem 0.8rem',
                      background: 'rgba(255,255,255,0.02)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewsReaderPopup;
