import { useEffect, useMemo, useState } from 'react'
import { motion } from "framer-motion";
import {
  FiClock,
  FiExternalLink,
  FiFilter,
  FiMessageCircle,
  FiZap,
  FiShare2
} from "react-icons/fi";

import NewsReaderPopup from '../components/popups/NewsReaderPopup';
import { fetchMultiSourceNews } from '../lib/fetchApi';
import { buildNewsSummary } from '../lib/newsSummarizer';

const News = () => {
  const [filterTopic, setFilterTopic] = useState('all')
  const [filterTime, setFilterTime] = useState('latest')
  const [sortBy, setSortBy] = useState('newest')
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadNews = async () => {
      setLoading(true)
      setError('')

      try {
        const query = filterTopic === 'all'
          ? 'humanitarian OR climate OR security OR conflict OR disaster OR outbreak'
          : filterTopic

        const articles = await fetchMultiSourceNews({ query, pageSize: 12 })

        if (!isMounted) return

        setNews(articles)
      } catch (err) {
        if (!isMounted) return
        console.error('News fetch failed:', err)
        setError('Unable to load live news right now. Please try again shortly.')
        setNews([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadNews()

    return () => {
      isMounted = false
    }
  }, [filterTopic])

  const filteredNews = useMemo(() => {
    return news
      .filter((article) => {
        const topicMatch = filterTopic === 'all' || article.topic === filterTopic || article.topic === 'general'
        const timeMatch = filterTime === 'latest' || (filterTime === 'today' && article.time === 'today') || (filterTime === 'week' && article.time === 'week') || (filterTime === 'older' && article.time === 'older')

        return topicMatch && timeMatch
      })
      .sort((a, b) => {
        if (sortBy === 'significance') {
          return (b.significance || 0) - (a.significance || 0)
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '')
        }

        return new Date(b.publishedAt || b.date || 0) - new Date(a.publishedAt || a.date || 0)
      })
  }, [filterTime, filterTopic, news, sortBy])

  const askTelvin = () => {
    // Telvin is intentionally disabled for this release.
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingTop: "140px", paddingBottom: "40px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h1
            variants={itemVariants}
            className="text-gradient"
            style={{ marginBottom: '1rem', fontSize: '3rem' }}>
            News Feed
          </motion.h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Explore clear, synthesized reports built from multiple sources. Latest events and developments that matter around the world.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className='card glass news-filter'>
          <div className='news-filter-title'>
            <FiFilter />
            <span>Filter News:</span>
          </div>

          <div className='news-filter-control'>
            <label>Topic:</label>
            <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}>
              <option value="all">All News</option>
              <option value="security">Security</option>
              <option value="weather">Weather</option>
              <option value="environment">Environment</option>
              <option value="health">Health</option>
              <option value="conflict">Conflict</option>
              <option value="humanitarian">Humanitarian</option>
              <option value="technology">Technology</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className='news-filter-control'>
            <label>Time:</label>
            <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="older">Older</option>
            </select>
          </div>

          <div className='news-filter-control'>
            <label>Sort:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="significance">Most Significant</option>
              <option value="title">Relevance</option>
            </select>
          </div>

          <div className='news-count'>
            {!loading ? `${filteredNews.length} ${filteredNews.length === 1 ? 'report' : 'reports'} found` : 'Loading...'}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='card glass news-empty'
            style={{ marginTop: '1rem', minHeight: 'auto', padding: '1.25rem' }}
          >
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{error}</p>
          </motion.div>
        )}

        <motion.div
          initial='hidden'
          animate='visible'
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className='news-feed'
        >
          {loading ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className='card glass news-empty'
            >
              <FiFilter />
              <h3>Loading live reports</h3>
              <p>Checking multiple public news sources for the latest updates.</p>
            </motion.div>
          ) : filteredNews.length > 0 ? (
            filteredNews.map((article) => (
              <motion.article
                key={article.id || `${article.title}-${article.source}`}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
                className='card glass news-card'>
                <div className='news-card-header'>
                  <div>
                    <span className='news-eyebrow'>{article.source || 'G.R.O.A REPORT'}</span>
                    <h2>{article.title}</h2>

                    <div className='news-date'>
                      <FiClock />
                      <span>{article.date}</span>
                    </div>
                  </div>
                  <button
                    className='telvin-news-btn'
                    onClick={askTelvin}
                    disabled
                    title='Ask Telvin about this report'
                    aria-label={`Ask Telvin about ${article.title}`}
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  >
                    <FiZap />
                  </button>
                </div>

                <div className='news-summary'>
                  <p>{buildNewsSummary(article)}</p>
                </div>

                <div className='news-actions'>
                  <button
                    className='news-read-btn'
                    onClick={() => setSelectedArticle(article)}
                  >
                    Read All <FiExternalLink />
                  </button>
                  <button
                    className='news-telvin-action'
                    onClick={askTelvin}
                    disabled
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  >
                    <FiMessageCircle /> Ask Telvin
                  </button>
                  <button
                    className='news-telvin-action'
                    disabled
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  >
                    <FiShare2 /> Share Article
                  </button>
                </div>

                <div className='news-sources'>
                  <span>Sources</span>
                  <div className='news-source-list'>
                    {(article.sources || [article.source || 'Public Report']).map((source) => (
                      <span key={`${article.id}-${source}`} className='news-source'>{source}</span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className='card glass news-empty'>
              <FiFilter />
              <h3>No reports found</h3>
              <p>No news reports currently match your selected filters.</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      <NewsReaderPopup
        article={selectedArticle}
        isOpen={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
      />
    </motion.div>
  )
}

export default News