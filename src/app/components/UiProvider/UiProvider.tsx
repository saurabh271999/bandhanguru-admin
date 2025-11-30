// ThemeContext.tsx
"use client";
import { message, Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { HookAPI } from "antd/es/modal/useModal";
import React, { createContext, ReactNode, useContext } from "react";


const UIContext = createContext<{
    modal: HookAPI;
    messageApi: MessageInstance;
}>({
    modal: {} as HookAPI,
    messageApi: {} as MessageInstance,
});

export const UiProvider = ({ children }: { children: ReactNode }) => {
    const [modal, contextHolder] = Modal.useModal();
    const [messageApi, messageContextHolder] = message.useMessage();



    return (
        <UIContext.Provider value={{ modal, messageApi }}>
            {contextHolder}
            {messageContextHolder}
            {children}
        </UIContext.Provider>
    );
};

// Custom hook for easy usage
export const useUIProvider = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error("useModal must be used inside ModalProvider");
    }
    return context;
};




