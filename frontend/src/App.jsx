import {ThemeProvider} from './context/ThemeContext';
import { WallpaperProvider } from './context/WallpaperContext';
import { Routes, Route } from 'react-router';
import ChatPage from "./pages/ChatPage"
import AuthPage from './pages/AuthPage';
import { useAuth } from '@clerk/react';
import {Spinner} from "@heroui/react";
import { Navigate } from 'react-router';


function App() {
  const {isSignedIn, isLoaded} = useAuth();
  if(!isLoaded){
    return(
        <div className="flex items-center gap-8 w-full h-full">
              <Spinner className="animate-[spin_1.5s_linear_infinite] motion-reduce:animate-none" />
        </div>
    )
  }
  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route path="/" element={isSignedIn ? <ChatPage/> : <Navigate to={"/auth"} replace/>}/>
          <Route path="/auth" element={!isSignedIn ? <AuthPage/> : <Navigate to={"/"} replace/>}/>
        </Routes>
      </WallpaperProvider>
    </ThemeProvider>

  )
}

export default App