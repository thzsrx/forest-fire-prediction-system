import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import Layout from './components/Layout';
import { ThemeProvider } from './context/theme-provider';
import WeatherDashboard from './pages/weather-dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import CityPage from './pages/city-page';
import { SignupForm } from "@/components/SignupForm"
import { LoginForm } from "@/components/LoginForm"
import Adminpanel from "@/components/Adminpanel"; 

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, 
            gcTime: 10 * 60 * 1000,
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider defaultTheme='light'>
                    <Layout>
                        <Routes>
                            <Route path='/signup' element={<SignupForm />} />
                            <Route path='/login' element={<LoginForm />} />
                            <Route path='/' element={<WeatherDashboard />}/>
                            <Route path='/city/:cityName' element={<CityPage />}/>
                            <Route path='/admin' element={<Adminpanel />}/>
                        </Routes>
                    </Layout>
                </ThemeProvider>
            </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

export default App
