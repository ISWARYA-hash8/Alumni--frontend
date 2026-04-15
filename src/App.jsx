import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;