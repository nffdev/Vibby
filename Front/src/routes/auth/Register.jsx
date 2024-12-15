import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Lock, ArrowRight } from 'lucide-react';
import { BASE_API, API_VERSION } from "../../config.json";

export default function Register() {
    const [datas, setDatas] = useState({ email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');

    async function register() {
        if (!datas.email) return setError('Email is required.');
        if (!datas.password) return setError('Password is required.');
        if (!datas.confirmPassword) return setError('Password confirmation is required.');
        if (datas.password !== datas.confirmPassword) return setError('Passwords are not matching.');

        fetch(`${BASE_API}/v${API_VERSION}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datas)
        })
            .then(response => response.json())
            .then(json => {
                if (json.token) {
                    localStorage.setItem('token', json.token);
                    window.location.replace('/profile/onboarding');
                } else {
                    setError(json.message || 'An error occurred.');
                }
            })
            .catch(() => setError('An error occurred.'));
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center w-full min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-400 to-pink-500 text-white"
        >
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md space-y-8"
            >
                <div>
                    <motion.h1 
                        className="mt-6 text-center text-3xl font-extrabold"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                        Create Your Account
                    </motion.h1>
                </div>
                {error && (
                    <motion.p 
                        className="text-red-500 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {error}
                    </motion.p>
                )}
                <motion.form 
                    className="mt-8 space-y-6"
                    onSubmit={(e) => e.preventDefault()}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                            <User className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" size={20} />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm pl-10"
                                placeholder="Email address"
                                onChange={(e) => setDatas(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" size={20} />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm pl-10"
                                placeholder="Password"
                                onChange={(e) => setDatas(prev => ({ ...prev, password: e.target.value }))}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" size={20} />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm pl-10"
                                placeholder="Confirm Password"
                                onChange={(e) => setDatas(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            onClick={register}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <ArrowRight className="h-5 w-5 text-white group-hover:text-gray-400" aria-hidden="true" />
                            </span>
                            Sign up
                        </Button>
                    </div>
                </motion.form>
            </motion.div>
            <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <Link to="/auth/login" className="font-medium text-white hover:text-gray-500 transition-colors">
                    Already have an account? Sign in
                </Link>
            </motion.div>
        </motion.div>
    );
}
