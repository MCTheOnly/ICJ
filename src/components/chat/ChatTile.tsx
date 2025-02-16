import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { ChatMessage as ComponentsChatMessage } from "@livekit/components-react";
import { join } from "path";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'

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

const LOADING_MARKER = '...';
const RESTRICTED_CHARS = [LOADING_MARKER, ' ...', '... ', ' ... '];

export const ChatTile = ({ messages, accentColor, onSend }: ChatTileProps) => {
    const [messageAggregator, setMessageAggregator] = useState<ChatMessageType[]>([]);
    const [joinedResponse, setJoinedResponse] = useState<string>('');

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
                        const isRestricted = RESTRICTED_CHARS.includes(message.message);
                        const sanitizedMessage = {...message, message: message.message.replace(LOADING_MARKER, '')};

                        if (!isInArray && !isRestricted) {
                            setMessageAggregator(prev => [...prev, sanitizedMessage]);
                        }
                    }
                });
            }, 3000);
        };

        debouncedAggregator();
    }, [messages, messageAggregator]);

    useEffect(() => {
        console.log('aggregator: ', messageAggregator);

        setJoinedResponse(messageAggregator.map(item => item.message).join(' '));
    }, [messageAggregator]);

    
    useEffect(() => {
        console.log('joinedResponse: ', joinedResponse);
    }, [joinedResponse]);

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
                        const hideName = index >= 1 && allMsg[index - 1].name === message.name;

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
                {joinedResponse && (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{joinedResponse}</ReactMarkdown>
                )}
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
