import MovieDisplayCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";
import useFetch from "@/services/usefetch";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

/**
 * Search Component
 * Handles movie searching with debouncing and updates search history in Appwrite.
 */
const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch movies based on the search query
  // The second argument 'false' prevents automatic fetching on mount
  const {
    data: movies = [],
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  // Update search query state
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Debounced search effect
  // Waits for 500ms after the user stops typing before triggering the search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();

        // Update search count in Appwrite if results are found
        if (movies?.length! > 0 && movies?.[0]) {
          await updateSearchCount(searchQuery, movies[0]);
        }
      } else {
        // Reset results if search query is empty
        reset();
      }
    }, 500);

    // Clear timeout on every query change to ensure only the last one executes
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-primary">
      {/* Background Image */}
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        className="px-5"
        data={movies as Movie[]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieDisplayCard {...item} />}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            {/* Logo */}
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            {/* Search Bar */}
            <View className="my-5">
              <SearchBar
                placeholder="Search for a movie"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            {/* Loading Indicator */}
            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}

            {/* Error Message */}
            {error && (
              <Text className="text-red-500 px-5 my-3">
                Error: {error.message}
              </Text>
            )}

            {/* Search Results Header */}
            {!loading &&
              !error &&
              searchQuery.trim() &&
              movies?.length! > 0 && (
                <Text className="text-xl text-white font-bold">
                  Search Results for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim()
                  ? "No movies found"
                  : "Start typing to search for movies"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
