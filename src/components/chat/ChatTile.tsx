import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { ChatMessage as ComponentsChatMessage } from "@livekit/components-react";
import { useEffect, useRef, useState } from "react";

const inputHeight = 48;

export type ChatMessageType = {
    name: string;
    message: string;
    isSelf: boolean;
    timestamp: number;
};

type ChatTileProps = {
    messages: ChatMessageType[];
    accentColor: string;
    onSend?: (message: string) => Promise<ComponentsChatMessage>;
};

export const ChatTile = ({ messages, accentColor, onSend }: ChatTileProps) => {
    const [messageAggregator, setMessageAggregator] = useState<ChatMessageType[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [containerRef, messages]);

    useEffect(() => {
        const debouncedAggregator = () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                messages.forEach(message => {
                    if (!message.isSelf) {
                        const isInArray = messageAggregator.find(item => item.message === message.message);

                        if (!isInArray) {
                            setMessageAggregator(prev => [...prev, message]);
                        }
                    }
                });
            }, 200);
        };

        debouncedAggregator();
    }, [messages, messageAggregator]);

    useEffect(() => {
        console.log('aggregator: ', messageAggregator);
    }, [messageAggregator]);

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div
                ref={containerRef}
                className="overflow-y-auto"
                style={{
                height: `calc(100% - ${inputHeight}px)`,
                }}
            >
                <div className="flex flex-col min-h-full justify-end">
                    {messages.map((message, index, allMsg) => {
                        const hideName =
                        index >= 1 && allMsg[index - 1].name === message.name;

                        return (
                        <ChatMessage
                            key={index}
                            hideName={hideName}
                            name={message.name}
                            message={message.message}
                            isSelf={message.isSelf}
                            accentColor={accentColor}
                        />
                        );
                    })}
                </div>
            </div>
            <ChatMessageInput
                height={inputHeight}
                placeholder="Type a message"
                accentColor={accentColor}
                onSend={onSend}
            />
        </div>
    );
};
