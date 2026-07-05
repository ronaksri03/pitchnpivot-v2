export function getAccountType(user) {
  return user?.user_metadata?.account_type ?? "individual";
}
