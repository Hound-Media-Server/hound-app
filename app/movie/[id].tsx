import MovieDetailsMobile from "@/screens/movie/MovieDetails";
import MovieDetailsTV from "@/screens/movie/MovieDetails.tv";
import { Platform } from "react-native";

export default function MovieDetails() {
  if (Platform.isTV) {
    return <MovieDetailsTV />;
  }
  return <MovieDetailsMobile />;
}
