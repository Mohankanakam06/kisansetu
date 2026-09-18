export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("kisansetu_token");
    localStorage.removeItem("kisansetu_user");
    document.cookie = "kisansetu_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/login";
  }
};
