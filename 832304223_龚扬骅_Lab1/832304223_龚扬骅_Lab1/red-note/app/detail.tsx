import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { initialPosts } from "../data/posts";

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = initialPosts.find((p) => p.id === id);


  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Post not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image source={{ uri: post.img }} style={styles.image} />
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.likes}>❤️ {post.likes} likes</Text>
      <View style={styles.comments}>
        <Text style={styles.commentHeader}>Comments:</Text>
        {post.comments.length > 0 ? (
          post.comments.map((c, i) => (
            <Text key={i} style={styles.comment}>
              • {c}
            </Text>
          ))
        ) : (
          <Text style={styles.comment}>No comments yet.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  image: { width: "100%", height: 300, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  likes: { fontSize: 16, color: "#555", marginBottom: 12 },
  comments: { marginTop: 10 },
  commentHeader: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  comment: { fontSize: 14, color: "#444", marginBottom: 4 },
});
