// filename: client/src/pages/AccessManagement/AccessManagement.tsx
import React, { useState } from 'react';
import styles from './AccessManagement.module.scss';
import Layout from '../../components/organisms/Layout/Layout';
import Input from '../../components/atoms/Input/Input';
import Button from '../../components/atoms/Buttons/Button';
import Icon from '../../components/atoms/Icon/Icon';
import SearchBar from '../../components/molecules/SearchBar/SearchBar';
import { useGetUsersQuery, useUpgradeUserToInstructorMutation } from '../../services/adminApi';

export const AccessManagement: React.FC = () => {
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch only instructors
  const { data: instructorsData, isLoading: listLoading, refetch } = useGetUsersQuery({
    page,
    limit: 5,
    role: 'instructor',
    ...(search ? { search } : {}),
  });

  const [upgradeUserTrigger, { isLoading: assignLoading }] = useUpgradeUserToInstructorMutation();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await upgradeUserTrigger({ email }).unwrap();
      showToast('success', `${email} added as Instructor`);
      setEmail('');
      refetch();
    } catch (err: any) {
      const msg = err?.data?.error?.message || 'Failed to add — email not registered';
      showToast('error', msg);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <Layout>
      <div className={styles.container}>
        {/* Toast Notification */}
        {toast && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            <Icon 
              name={toast.type === 'success' ? 'check-verified' : 'stat-warning'} 
              size={18} 
              className={styles.toastIcon} 
            />
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className={styles.toastClose}>
              <Icon name="x-close" size={14} />
            </button>
          </div>
        )}

        <div className={styles.header}>
          <h1 className={styles.title}>Access Management</h1>
          <p className={styles.subtitle}>Manage user roles across the platform</p>
        </div>

        {/* Assign Form Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Assign Instructor Role</h3>
          <p className={styles.cardDesc}>Enter a registered user's email to grant them Instructor access.</p>
          
          <form onSubmit={handleAssign} className={styles.assignForm}>
            <div className={styles.inputWrapper}>
              <Input
                label="Email Address"
                type="email"
                placeholder="priya@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={assignLoading}
                required
              />
              <span className={styles.inputHint}>User must already be registered on the platform</span>
            </div>
            <Button type="submit" isLoading={assignLoading} className={styles.assignBtn}>
              Assign as Instructor
            </Button>
          </form>
        </div>

        {/* Instructors Table Section */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Registered Instructors</h3>
            <SearchBar 
              value={search} 
              onChange={(val) => { setSearch(val); setPage(1); }} 
              placeholder="Search by name or email..." 
            />
          </div>

          <div className={styles.tableWrapper}>
            {listLoading ? (
              <div className={styles.loadingState}>
                <span className={styles.spinner} />
                <span>Loading instructors...</span>
              </div>
            ) : instructorsData?.users.length === 0 ? (
              <div className={styles.emptyState}>
                <Icon name="empty-state" size={48} className={styles.emptyIcon} />
                <h4 className={styles.emptyTitle}>No Instructors Found</h4>
                <p className={styles.emptyText}>No registered instructors match your search queries.</p>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>INSTRUCTOR NAME</th>
                      <th>EMAIL ADDRESS</th>
                      <th>STATUS</th>
                      <th>ASSIGNED DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructorsData?.users.map((inst) => (
                      <tr key={inst.id}>
                        <td className={styles.nameCell}>
                          <div className={styles.avatar}>
                            {inst.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                          </div>
                          <span className={styles.name}>{inst.name}</span>
                        </td>
                        <td className={styles.emailText}>{inst.email}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[inst.status]}`}>
                            {inst.status}
                          </span>
                        </td>
                        <td className={styles.dateText}>{formatDate(inst.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {instructorsData && instructorsData.pagination.pages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className={styles.pageBtn}
                    >
                      <Icon name="pagination-prev" size={16} />
                      Previous
                    </button>
                    
                    <span className={styles.pageInfo}>
                      Page {page} of {instructorsData.pagination.pages}
                    </span>

                    <button
                      type="button"
                      disabled={page === instructorsData.pagination.pages}
                      onClick={() => setPage(page + 1)}
                      className={styles.pageBtn}
                    >
                      Next
                      <Icon name="pagination-next" size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default AccessManagement;
