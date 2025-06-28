import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, tokenStorage } from "@/lib/api";
import { toast } from "sonner";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: authApi.getProfile,
    enabled: !!tokenStorage.get(),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      tokenStorage.set(data.access_token);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Logged in successfully!");
    },
    onError: () => {
      toast.error("Invalid credentials");
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Account created successfully! Please log in.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Registration failed");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to change password");
    },
  });

  const logout = () => {
    tokenStorage.remove();
    queryClient.clear();
    window.location.href = "/login";
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoadingUser,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
  };
};
