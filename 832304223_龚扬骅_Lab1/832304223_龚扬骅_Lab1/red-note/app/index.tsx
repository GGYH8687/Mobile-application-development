import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PostCard from "../components/PostCard";
import { initialPosts } from "../data/posts";
import { Post } from "../types";

export default function HomeScreen() {
  const [data, setData] = useState<Post[]>(initialPosts);
  const router = useRouter();

  const handleImagePress = (id: string) => {
    router.push({ pathname: "/detail", params: { id: id } });
  };

  const toggleLike = (id: string): void => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, likes: item.likes + (item.liked ? -1 : 1), liked: !item.liked }
          : item
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>CS385FZ Practical Project – Xiaohongshu_v1</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grid}>
          {data.map((item) => (
            <Link
              key={item.id}
              href={{ pathname: "/detail", params: { id: item.id } }}
              asChild
            >
              <PostCard
                  post={item}
                  onLike={() => toggleLike(item.id)}
                  onImagePress={() => handleImagePress(item.id)} // 传递点击事件
              />
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    padding: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    color: "#FF0000",
  },
  scroll: { padding: 10 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
