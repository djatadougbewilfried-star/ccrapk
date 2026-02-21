/**
 * Écran Chat de la Tribu - Centre Chrétien de Réveil
 * Chat en temps réel avec Supabase Realtime
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "../../../stores/authStore";
import { useTribuChat } from "../../../hooks/useTribu";
import { useTribu } from "../../../hooks/useTribu";
import { formatMemberName } from "../../../services/tribu.service";

export default function ChatScreen() {
  const { user } = useAuthStore();
  const { myTribu } = useTribu();
  const { messages, loading, sending, sendMessage } = useTribuChat(myTribu?.id);

  const [inputMessage, setInputMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll vers le bas quand nouveaux messages
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const messageToSend = inputMessage.trim();
    setInputMessage("");
    await sendMessage(messageToSend);
  };

  const tribuColor = myTribu?.color || "#6366F1";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="flex-row items-center px-5 py-4"
        style={{ backgroundColor: tribuColor }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">
            Chat {myTribu?.name}
          </Text>
          <Text className="text-white/80 text-sm">
            {myTribu?.member_count} membres
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(app)/tribu/membres" as any)}>
          <Ionicons name="people" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
        >
          {loading ? (
            <View className="flex-1 items-center justify-center py-10">
              <ActivityIndicator size="large" color={tribuColor} />
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 text-center">
                Aucun message pour le moment.{"\n"}Soyez le premier à écrire !
              </Text>
            </View>
          ) : (
            messages.map((message, index) => {
              const isMe = message.sender_id === user?.id;
              const showAvatar =
                index === 0 ||
                messages[index - 1].sender_id !== message.sender_id;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isMe={isMe}
                  showAvatar={showAvatar}
                  tribuColor={tribuColor}
                />
              );
            })
          )}
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-3 bg-white border-t border-gray-200">
          <View className="flex-row items-end">
            <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 mr-3">
              <TextInput
                className="text-gray-900 max-h-24"
                placeholder="Votre message..."
                placeholderTextColor="#9CA3AF"
                value={inputMessage}
                onChangeText={setInputMessage}
                multiline
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputMessage.trim() || sending}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: inputMessage.trim() ? tribuColor : "#E5E7EB",
              }}
            >
              {sending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons
                  name="send"
                  size={20}
                  color={inputMessage.trim() ? "white" : "#9CA3AF"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANT MESSAGE
// ============================================

interface MessageBubbleProps {
  message: any;
  isMe: boolean;
  showAvatar: boolean;
  tribuColor: string;
}

function MessageBubble({ message, isMe, showAvatar, tribuColor }: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      className={`flex-row mb-3 ${isMe ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar (autre personne) */}
      {!isMe && showAvatar && (
        <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-2 overflow-hidden">
          {message.sender?.photo_url ? (
            <Image
              source={{ uri: message.sender.photo_url }}
              className="w-8 h-8"
            />
          ) : (
            <Ionicons name="person" size={16} color="#9CA3AF" />
          )}
        </View>
      )}

      {!isMe && !showAvatar && <View className="w-10" />}

      {/* Bulle */}
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isMe ? "rounded-br-sm" : "rounded-bl-sm"
        }`}
        style={{
          backgroundColor: isMe ? tribuColor : "white",
        }}
      >
        {/* Nom (autre personne) */}
        {!isMe && showAvatar && (
          <Text
            className="text-xs font-semibold mb-1"
            style={{ color: tribuColor }}
          >
            {formatMemberName(
              message.sender?.first_name,
              message.sender?.last_name
            )}
          </Text>
        )}

        {/* Message */}
        <Text className={isMe ? "text-white" : "text-gray-900"}>
          {message.content}
        </Text>

        {/* Heure */}
        <Text
          className={`text-xs mt-1 ${
            isMe ? "text-white/70 text-right" : "text-gray-400"
          }`}
        >
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}