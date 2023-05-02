import axios from "axios";
import { useState } from "react";
import { env } from "./utils";

const routeUrl = env().routeUrl;

export type CallAuthenticate = (username: string, password: string) => void;

export const useAuth = () => {
  const [clientId, setClientId] = useState<string | undefined>();
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [authFailMessage, setAuthFailMessage] = useState("");
  const [credentials, setCredentials] = useState<{username: string, password: string} | undefined>();

  // Authenticate from search params and set axios Authorization header
  function authenticate(username: string, password: string) {
    // Login
    // TODO: Handle authentication failure with username/password
    setCredentials({username, password});
    (async () => {
      axios.post(`${routeUrl}/auth`, {
        username,
        password
      }).then(res => {
        setClientId(res.data.clientId);
        setAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = res.data.clientId;
      }).catch(error => {
        if(!error.response) {
          setAuthFailed(true);
          setAuthFailMessage("Failed to connect to the server.");
        }
      })
    })();
  }

  return {clientId, isAuthenticated, authFailed, authFailMessage, authenticate, credentials};
}