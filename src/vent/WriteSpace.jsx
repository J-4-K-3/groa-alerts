import { useState } from "react";
import { motion } from "framer-motion";
import '../App.css'

const WriteSpace = ({ onBack }) => {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!text.trim()) return;

    /*
    Backend hook goes here.
   
    Important:
    Do not persist the submitted text unless the
    privacy architecture explicitly allows it.
    */

    setText("");
    setSubmitted(true);
  };

  return (
    <div className="vent-space-page">
      <button
        className="vent-back-button"
        onClick={onBack}
      >
        ← Back to Vent Space
      </button>

      <div className="vent-space-heading">
        <span className="vent-eyebrow">
          WRITE SPACE
        </span>

        <h1 className="text-gradient">
          Let it out.
        </h1>

        <p>
          Write whatever is on your mind. You don't need
          to make it sound perfect.
        </p>
      </div>

      <form
        className="vent-writing-card glass"
        onSubmit={handleSubmit}
      >
        <div className="vent-writing-header">
          <span>YOUR SPACE</span>

          <span>
            {text.length} characters
          </span>
        </div>

        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setSubmitted(false);
          }}
          placeholder="What's on your mind?"
          className="vent-writing-input"
          maxLength={10000}
        />

        <div className="vent-writing-footer">
          <span>
            Nothing here becomes a public post.
          </span>

          <motion.button
            type="submit"
            className="vent-primary-button"
            whileTap={{ scale: 0.97 }}
            disabled={!text.trim()}
          >
            Let it out →
          </motion.button>
        </div>
      </form>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="vent-success-card"
        >
          <span>✓</span>

          <div>
            <strong>
              It's out.
            </strong>

            <p>
              Your writing was cleared from this space.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WriteSpace;
