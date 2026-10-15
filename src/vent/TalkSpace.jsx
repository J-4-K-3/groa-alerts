import { useState } from "react";
import { motion } from "framer-motion";
import '../App.css'

const TalkSpace = ({ onBack }) => {
  const [stage, setStage] = useState("preferences");

  const [preferences, setPreferences] = useState({
    ageRange: "any",
    gender: "any",
    language: "any",
    interests: [],
    conversation: "anything",
  });

  const [message, setMessage] = useState("");

  const interests = [
    "Gaming",
    "Music",
    "Movies",
    "Technology",
    "Sports",
    "Art",
    "School",
    "Work",
  ];

  const toggleInterest = (interest) => {
    setPreferences((previous) => {
      const exists = previous.interests.includes(interest);

      return {
        ...previous,
        interests: exists
          ? previous.interests.filter(
            (item) => item !== interest
          )
          : [...previous.interests, interest],
      };
    });
  };

  const findPerson = async () => {
    /*
      Backend hook:

      const match = await findVentMatch(preferences);

      The backend should:
      1. Validate the user's preferences.
      2. Keep minors separated from adults.
      3. Find compatible available users.
      4. Randomly select a compatible person.
      5. Create an ephemeral chat session.
    */

    setStage("searching");

    setTimeout(() => {
      setStage("chat");
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
            <span>◉</span>
          </div>

          <h1>
            Finding someone...
          </h1>

          <p>
            Looking for someone who fits your conversation
            preferences.
          </p>

          <button
            className="vent-secondary-button"
            onClick={() => setStage("preferences")}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (stage === "chat") {
    return (
      <div className="vent-space-page">
        <div className="vent-chat-header">
          <button
            className="vent-back-button"
            onClick={onBack}
          >
            ← Leave conversation
          </button>

          <div className="vent-chat-status">
            <span className="vent-online-dot" />
            Connected
          </div>
        </div>

        <div className="vent-chat-card glass">
          <div className="vent-chat-top">
            <div>
              <span className="vent-eyebrow">
                ANONYMOUS CONVERSATION
              </span>

              <h2>
                Someone is listening.
              </h2>
            </div>
          </div>

          <div className="vent-chat-messages">
            <div className="vent-message received">
              Hey. How's your day going?
            </div>

            <div className="vent-message sent">
              It's been a lot honestly.
            </div>
          </div>

          <form
            className="vent-chat-input"
            onSubmit={(event) => {
              event.preventDefault();

              if (!message.trim()) return;

              /*
                Backend hook:
                sendVentMessage(message)
              */

              setMessage("");
            }}
          >
            <input
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Type something..."
            />

            <button
              type="submit"
              disabled={!message.trim()}
            >
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
          TALK SPACE
        </span>

        <h1 className="text-gradient">
          Find someone to talk to.
        </h1>

        <p>
          Choose what matters to you. We'll find someone
          from the available conversation pool.
        </p>
      </div>

      <div className="vent-preference-card glass">
        <div className="vent-filter-section">
          <label>
            Age
          </label>

          <select
            value={preferences.ageRange}
            onChange={(event) =>
              setPreferences({
                ...preferences,
                ageRange: event.target.value,
              })
            }
          >
            <option value="any">
              Any age
            </option>
            <option value="13-17">
              13–17
            </option>
            <option value="18-24">
              18–24
            </option>
            <option value="25-34">
              25–34
            </option>
            <option value="35-44">
              35–44
            </option>
            <option value="45+">
              45+
            </option>
          </select>
        </div>

        <div className="vent-filter-section">
          <label>
            Gender
          </label>

          <select
            value={preferences.gender}
            onChange={(event) =>
              setPreferences({
                ...preferences,
                gender: event.target.value,
              })
            }
          >
            <option value="any">
              Any
            </option>
            <option value="man">
              Man
            </option>
            <option value="woman">
              Woman
            </option>
            <option value="nonbinary">
              Non-binary / Other
            </option>
            <option value="unspecified">
              Prefer not to say
            </option>
          </select>
        </div>

        <div className="vent-filter-section">
          <label>
            Language
          </label>

          <select
            value={preferences.language}
            onChange={(event) =>
              setPreferences({
                ...preferences,
                language: event.target.value,
              })
            }
          >
            <option value="any">
              Any language
            </option>
            <option value="english">
              English
            </option>
            <option value="french">
              French
            </option>
            <option value="swahili">
              Swahili
            </option>
          </select>
        </div>

        <div className="vent-filter-section">
          <label>
            Interests
          </label>

          <div className="vent-interest-list">
            {interests.map((interest) => {
              const active =
                preferences.interests.includes(interest);

              return (
                <button
                  type="button"
                  key={interest}
                  className={`vent-interest ${active ? "active" : ""
                    }`}
                  onClick={() =>
                    toggleInterest(interest)
                  }
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <div className="vent-filter-section">
          <label>
            Conversation preference
          </label>

          <select
            value={preferences.conversation}
            onChange={(event) =>
              setPreferences({
                ...preferences,
                conversation: event.target.value,
              })
            }
          >
            <option value="anything">
              Anything
            </option>
            <option value="listen">
              Someone to listen
            </option>
            <option value="casual">
              Casual conversation
            </option>
            <option value="interest">
              Talk about a shared interest
            </option>
          </select>
        </div>

        <div className="vent-matching-notice">
          <span>🔒</span>

          <p>
            Your preferences are used for matching. They
            don't need to be revealed to the person you
            match with.
          </p>
        </div>

        <motion.button
          className="vent-primary-button vent-find-button"
          onClick={findPerson}
          whileTap={{ scale: 0.98 }}
        >
          Find Someone →
        </motion.button>
      </div>
    </div>
  );
};

export default TalkSpace;