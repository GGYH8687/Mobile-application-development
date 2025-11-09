import { Stack } from "expo-router";
export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "Welcome",
                    headerTitleAlign: "center"
                }}
            />
            <Stack.Screen name="detail" options={{ title: "Detail" }} />
        </Stack>
    );
}