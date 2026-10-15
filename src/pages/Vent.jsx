import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import VentHome from "../vent/VentHome"; 
import WriteSpace from "../vent/WriteSpace"; 
import TalkSpace from "../vent/TalkSpace"; 
import ListenerSpace from "../vent/ListenerSpace"; 
import ProfessionalSpace from "../vent/ProfessionalSpace"; 

const Vent = () => {
  const [mode, setMode] = useState("home");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const goHome = () => {
    setMode("home");
  };

  const renderSpace = () => {
    switch (mode) {
      case "write":
        return <WriteSpace onBack={goHome} />;

      case "talk":
        return <TalkSpace onBack={goHome} />;

      case "listener":
        return <ListenerSpace onBack={goHome} />;

      case "professional":
        return <ProfessionalSpace onBack={goHome} />;

      default:
        return (
          <VentHome
            onSelect={setMode}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        paddingTop: "140px",
        paddingBottom: "40px",
      }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderSpace()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default Vent