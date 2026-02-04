import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getUsers,
  createChallenge,
  getChallenges,
} from "../../services/db";
import {
  Users,
  UserPlus,
  Check,
  X,
  Swords,
  Trophy,
  ArrowLeft,
} from "lucide-react";

const Friends: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "friends" | "requests" | "challenges"
  >("friends");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user) return;

    setFriends(getFriends(user.id));
    setRequests(getFriendRequests(user.id));
    setAllUsers(
      getUsers().filter((u) => u.id !== user.id && u.role === "USER"),
    );
    setChallenges(getChallenges(user.id));
  };

  const handleSendRequest = (friendId: string) => {
    try {
      sendFriendRequest(user!.id, friendId);
      alert("Do'stlik so'rovi yuborildi!");
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAcceptRequest = (friendId: string) => {
    try {
      acceptFriendRequest(user!.id, friendId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    if (confirm("Do'stlikni bekor qilmoqchimisiz?")) {
      removeFriend(user!.id, friendId);
      loadData();
    }
  };

  const handleChallenge = (friendId: string) => {
    try {
      createChallenge(user!.id, friendId, 20);
      alert("Challenge yuborildi! Do'stingiz qabul qilganida test boshlaydi.");
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isFriend = (userId: string) => {
    return friends.some((f) => f.userId === userId || f.friendId === userId);
  };

  const hasPendingRequest = (userId: string) => {
    return requests.some((r) => r.userId === userId);
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !isFriend(u.id),
  );

  const myFriendsData = friends
    .map((f) => {
      const friendId = f.userId === user?.id ? f.friendId : f.userId;
      return allUsers.find((u) => u.id === friendId);
    })
    .filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate("/user")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Orqaga qaytish"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Users className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Do'stlar</h1>
        </div>
        <p className="text-purple-100 ml-12">
          Do'stlar qo'shing va raqobatlashing!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("friends")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === "friends"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          }`}
        >
          Do'stlar ({myFriendsData.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === "requests"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          }`}
        >
          So'rovlar ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === "challenges"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          }`}
        >
          Challenges ({challenges.length})
        </button>
      </div>

      {/* Friends Tab */}
      {activeTab === "friends" && (
        <div className="grid md:grid-cols-2 gap-4">
          {myFriendsData.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                Hali do'stlaringiz yo'q
              </p>
            </div>
          ) : (
            myFriendsData.map((friend: any) => (
              <div
                key={friend.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-white">
                      {friend.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {friend.totalPoints} ball
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleChallenge(friend.id)}
                      className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                      title="Challenge"
                    >
                      <Swords className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">
                Yangi so'rovlar yo'q
              </p>
            </div>
          ) : (
            requests.map((request: any) => {
              const requester = allUsers.find((u) => u.id === request.userId);
              if (!requester) return null;

              return (
                <div
                  key={request.userId}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {requester.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">
                        {requester.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Do'stlik so'rovi yubordi
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.userId)}
                        className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removeFriend(user!.id, request.userId)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === "challenges" && (
        <div className="space-y-4">
          {challenges.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Swords className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                Hali challenge'lar yo'q
              </p>
            </div>
          ) : (
            challenges.map((challenge: any) => {
              const opponent = allUsers.find(
                (u) =>
                  u.id ===
                  (challenge.challengerId === user?.id
                    ? challenge.challengedId
                    : challenge.challengerId),
              );
              if (!opponent) return null;

              const isChallenger = challenge.challengerId === user?.id;
              const myScore = isChallenger
                ? challenge.challengerScore
                : challenge.challengedScore;
              const opponentScore = isChallenger
                ? challenge.challengedScore
                : challenge.challengerScore;

              return (
                <div
                  key={challenge.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white">
                      {opponent.name} bilan Challenge
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        challenge.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : challenge.status === "accepted"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {challenge.status === "completed"
                        ? "Tugallandi"
                        : challenge.status === "accepted"
                          ? "Qabul qilindi"
                          : "Kutilmoqda"}
                    </span>
                  </div>

                  {challenge.status === "completed" && (
                    <div className="grid grid-cols-3 gap-2 text-center mt-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Siz
                        </p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {myScore}%
                        </p>
                      </div>
                      <div className="flex items-center justify-center">
                        <Trophy
                          className={`w-8 h-8 ${
                            myScore !== undefined &&
                            opponentScore !== undefined &&
                            myScore > opponentScore
                              ? "text-yellow-500"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {opponent.name}
                        </p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {opponentScore}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
