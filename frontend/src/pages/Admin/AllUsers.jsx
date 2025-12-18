import { useState, useEffect } from "react";
import {
  getAllUsers,
  getArchivedUsers,
  deactivateUser,
  reactivateUser,
  deleteUser,
} from "../../services/userService";
import ConfirmModal from "../../components/common/ConfirmModal";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardHeader from "../../components/layout/DashboardHeader";
import Alert from "../../components/common/Alert";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import { UsersIcon } from "../../components/common/icons/HeaderIcons";
import "./AllUsers.css";

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  const [deactivatedCount, setDeactivatedCount] = useState(0);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchArchivedCount();
    fetchAllUsersForCounts();
  }, [filterRole]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      let data;

      if (filterRole === "ARCHIVED") {
        data = await getArchivedUsers();
        setUsers(data);
      } else {
        data = await getAllUsers(currentPage, pageSize);
        setUsers(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      }
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedCount = async () => {
    try {
      const archivedUsers = await getArchivedUsers();
      setDeactivatedCount(archivedUsers.length);
    } catch {
      // Silently fail, this is just for counting
    }
  };

  const fetchAllUsersForCounts = async () => {
    try {
      // Fetch all users without pagination for accurate role counts
      const data = await getAllUsers(0, 1000); // Fetch with large page size
      setAllUsers(data.content);
    } catch {
      // Silently fail, this is just for counting
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (filterRole !== "ALL" && filterRole !== "ARCHIVED") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.studentId?.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeactivateClick = (userId, userName) => {
    setSelectedUser({ id: userId, name: userName });
    setConfirmAction("deactivate");
    setShowConfirmModal(true);
  };

  const handleReactivateClick = (userId, userName) => {
    setSelectedUser({ id: userId, name: userName });
    setConfirmAction("reactivate");
    setShowConfirmModal(true);
  };

  const confirmDeactivate = async () => {
    try {
      setActionLoading(true);
      await deactivateUser(selectedUser.id);
      setSuccess("User deactivated successfully");
      setShowConfirmModal(false);
      fetchUsers();
    } catch {
      setError("Failed to deactivate user");
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const confirmReactivate = async () => {
    try {
      setActionLoading(true);
      await reactivateUser(selectedUser.id);
      setSuccess("User reactivated successfully");
      setShowConfirmModal(false);
      fetchUsers();
    } catch {
      setError("Failed to reactivate user");
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setActionLoading(true);
      await deleteUser(selectedUser.id);
      setSuccess("User deleted successfully");
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete user");
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const roleFilters = [
    { label: "All Users", value: "ALL", count: totalElements },
    {
      label: "Members",
      value: "MEMBER",
      count: (filterRole === "ARCHIVED" ? allUsers : users).filter(
        (u) => u.role === "MEMBER"
      ).length,
    },
    {
      label: "Managers",
      value: "MANAGER",
      count: (filterRole === "ARCHIVED" ? allUsers : users).filter(
        (u) => u.role === "MANAGER"
      ).length,
    },
    {
      label: "Admins",
      value: "ADMIN",
      count: (filterRole === "ARCHIVED" ? allUsers : users).filter(
        (u) => u.role === "ADMIN"
      ).length,
    },
    {
      label: "Archived",
      value: "ARCHIVED",
      count: deactivatedCount,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="ADMIN">
        <Loader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="all-users-page">
        <DashboardHeader
          title="All Users"
          subtitle="Manage system users and accounts"
          icon={<UsersIcon />}
        />

        <div className="users-container">
          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          {success && (
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess("")}
            />
          )}

          {/* Controls */}
          <div className="users-controls">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, or member ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="clear-search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-buttons">
              {roleFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={`filter-btn ${
                    filterRole === filter.value ? "active" : ""
                  }`}
                  onClick={() => setFilterRole(filter.value)}
                >
                  {filter.label}
                  <span className="filter-count">{filter.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pagination Controls */}
          {!loading && filterRole !== "ARCHIVED" && totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="page-btn"
              >
                « Previous
              </button>
              <span className="page-info">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="page-btn"
              >
                Next »
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="results-info">
            Showing <strong>{filteredUsers.length}</strong> of{" "}
            <strong>
              {filterRole === "ARCHIVED" ? users.length : totalElements}
            </strong>{" "}
            users
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No Users Found</h3>
              <p>Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterRole("ALL");
                }}
                className="reset-btn"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.pictureUrl ? (
                              <img src={user.pictureUrl} alt={user.name} />
                            ) : (
                              <div className="avatar-placeholder">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="user-name">{user.name}</span>
                        </div>
                      </td>
                      <td className="email-cell">{user.email}</td>
                      <td>
                        <StatusBadge status={user.role} type="role" />
                      </td>
                      <td>
                        <StatusBadge
                          status={user.accountStatus}
                          type="account"
                        />
                      </td>
                      <td className="center-cell">{user.studentId || "—"}</td>
                      <td className="actions-cell">
                        {user.accountStatus === "DEACTIVATED" ? (
                          <button
                            className="action-btn reactivate"
                            onClick={() => handleReactivateClick(user.id, user.name)}
                            disabled={actionLoading}
                          >
                            ✓ Reactivate
                          </button>
                        ) : (
                          <button
                            className="action-btn deactivate"
                            onClick={() => handleDeactivateClick(user.id, user.name)}
                            disabled={actionLoading}
                          >
                            ⊘ Deactivate
                          </button>
                        )}
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteClick(user)}
                          disabled={actionLoading}
                        >
                          ✕ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showDeleteModal && selectedUser && (
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete User Account"
            message={`Are you sure you want to permanently delete ${selectedUser.name}'s account? This action cannot be undone.`}
            confirmText="Delete Permanently"
            cancelText="Cancel"
            loading={actionLoading}
            confirmVariant="danger"
          />
        )}

        {showConfirmModal && selectedUser && (
          <ConfirmModal
            isOpen={showConfirmModal}
            onClose={() => {
              setShowConfirmModal(false);
              setSelectedUser(null);
            }}
            onConfirm={
              confirmAction === "deactivate"
                ? confirmDeactivate
                : confirmReactivate
            }
            title={
              confirmAction === "deactivate"
                ? "Deactivate User Account"
                : "Reactivate User Account"
            }
            message={
              confirmAction === "deactivate"
                ? `Deactivate ${selectedUser.name}'s account?.`
                : `Reactivate ${selectedUser.name}'s account?.`
            }
            confirmText={confirmAction === "deactivate" ? "Deactivate" : "Reactivate"}
            cancelText="Cancel"
            loading={actionLoading}
            confirmVariant={confirmAction === "deactivate" ? "danger" : "primary"}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AllUsersPage;
