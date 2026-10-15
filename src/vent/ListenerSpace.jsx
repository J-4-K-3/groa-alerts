import { useState } from "react";
import { motion } from "framer-motion";
import '../App.css'

const ListenerSpace = ({ onBack }) => {
  const [stage, setStage] = useState("home");

  const findListener = () => {
    setStage("searching");

    /*
    Backend hook:
   
    await findListenerMatch({
    mode: "listener"
    });
    */

    setTimeout(() => {
      setStage("connected");
    }, 1800);
  };

  if (stage === "searching") {
    return (
      <div className="vent-space-page">
        <button
          className="vent-back-button"
          onClick={onBack}
        >
          ← Leave
        </button>

        <div className="vent-matching-state">
          <div className="vent-matching-orb">
            👂
          </div>

          <h1>
            Finding a listener...
          </h1>

          <p>
            Looking for someone available to listen.
          </p>
        </div>
      </div>
    );
  }

  if (stage === "connected") {
    return (
      <div className="vent-space-page">
        <button
          className="vent-back-button"
          onClick={onBack}
        >
          ← End conversation
        </button>

        <div className="vent-chat-card glass">
          <div className="vent-chat-top">
            <span className="vent-eyebrow">
              LISTENER SESSION
            </span>

            <h2>
              You're connected.
            </h2>

            <p>
              This person is here to listen. You don't
              have to perform, explain everything, or have
              the right words.
            </p>
          </div>

          <div className="vent-chat-messages">
            <div className="vent-message received">
              I'm here. Take your time.
            </div>
          </div>

          <form
            className="vent-chat-input"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            <input placeholder="Say what's on your mind..." />

            <button type="submit">
              →
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          LISTENER SPACE
        </span>

        <h1 className="text-gradient">
          You can talk. I'll listen.
        </h1>

        <p>
          Connect with someone who has chosen to be here
          simply to listen.
        </p>
      </div>

      <div className="vent-listener-card glass">
        <div className="vent-listener-icon">
          👂
        </div>

        <h2>
          No fixing. No judging.
        </h2>

        <p>
          Listeners aren't here to tell you what to do.
          They're here to give you another human being
          on the other side of the conversation.
        </p>

        <div className="vent-listener-points">
          <span>✓ Anonymous conversation</span>
          <span>✓ Temporary session</span>
          <span>✓ No public profile</span>
          <span>✓ End whenever you want</span>
        </div>

        <motion.button
          className="vent-primary-button"
          onClick={findListener}
          whileTap={{ scale: 0.98 }}
        >
          Find a Listener →
        </motion.button>
      </div>
    </div>
  );
};

export default ListenerSpace;
