import { useContext, createContext, useState } from "react";

import { login as userLogin } from "./../services/game-api/auth";
import { useDB } from "./DatabaseProvider";

const Context = createContext({
  login: (email, password) => {},
  user: {} as any,
  checkIn: () => {},
  authHeader: () => {},
});

export const useAuth = () => useContext(Context);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null) as any;
  const { models } = useDB();

  const login = async (email, password) => {
    const response = await userLogin(email, password);

    if (response.accessToken) {
      const authData = window.btoa(email + ":" + password);
      const user = await models.user.getOrCreate(response.id);

      await models.user.setAuthData(user.id, authData);
      const updatedUser = await models.user.updateUser(user.id, response);

      setUser(updatedUser.toJSON());
    }

    return response;
  };

  const checkIn = () => {};

  const authHeader = () => {
    if (user && user?.authData) {
      return { Authorization: "Basic " + user?.authData };
    } else {
      return {};
    }
  };

  const publicInterface = {
    login,
    user,
    checkIn,
    authHeader,
  };

  return (
    <Context.Provider value={publicInterface}>{children}</Context.Provider>
  );
};

export default AuthProvider;
