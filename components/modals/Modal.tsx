import { Modal, Platform, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { useEffect, useState } from "react";
import React, { createContext, useContext } from "react";

type ModalInternalContextType = {
  tvPressedOnce: boolean;
};

const ModalInternalContext = createContext<ModalInternalContextType | null>(
  null,
);

export function useModalInternal() {
  const ctx = useContext(ModalInternalContext);
  if (!ctx) {
    throw new Error("useModalInternal must be used inside ContextModal");
  }
  return ctx;
}

export function ContextModal({
  visible,
  modalTitle,
  children,
  onClose,
}: {
  visible: boolean;
  modalTitle: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const [tvPressedOnce, setTvPressedOnce] = useState(false);
  useEffect(() => {
    if (!visible) {
      setTvPressedOnce(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {Platform.isTV && !tvPressedOnce && (
        <Pressable
          focusable={Platform.isTV}
          hasTVPreferredFocus={Platform.isTV && !tvPressedOnce}
          className="absolute top-0 left-0 w-full h-full"
          onPress={() => {
            setTvPressedOnce(true);
          }}
        />
      )}
      <Pressable
        focusable={false}
        style={styles.modalOverlay}
        onPress={() => {
          onClose();
        }}
      >
        <ModalInternalContext.Provider value={{ tvPressedOnce }}>
          <Pressable style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>{modalTitle}</ThemedText>
            {children}
          </Pressable>
        </ModalInternalContext.Provider>
      </Pressable>
    </Modal>
  );
}

export function ModalAction({
  label,
  onPress,
  hasTVPreferredFocus,
}: {
  label: string;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
}) {
  const { tvPressedOnce } = useModalInternal();
  return (
    <Pressable
      style={styles.modalItem}
      className="px-2 rounded-lg focus:bg-gray-800"
      focusable={Platform.isTV}
      hasTVPreferredFocus={
        Platform.isTV && hasTVPreferredFocus && tvPressedOnce
      }
      onPress={() => {
        onPress();
      }}
    >
      <ThemedText className="text-white">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 460,
    maxHeight: "70%",
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 5,
    marginBottom: 20,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    // borderBottomWidth: 1,
    // borderBottomColor: "#333",
  },
  modalItemText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalItemTextFocused: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
  modalItemSubtext: {
    color: "#999",
    fontSize: 14,
    marginTop: 2,
  },
});
