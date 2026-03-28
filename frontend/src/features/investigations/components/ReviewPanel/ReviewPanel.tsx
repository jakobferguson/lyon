import { useState } from 'react';
import { Button, Modal, Badge } from '../../../../components/ui';
import type { Investigation, InvestigationReview, InvestigationStatus } from '../../types';
import { formatDateShort } from '../../utils';
import { usePermission } from '../../../../hooks/usePermission';
import { useAuthStore } from '../../../../stores/authStore';
import styles from './ReviewPanel.module.css';

interface ReviewPanelProps {
  investigation: Investigation;
}

const REVIEWABLE_STATUSES: InvestigationStatus[] = ['Complete', 'In Progress', 'Returned'];

function ReviewHistoryItem({ review }: { review: InvestigationReview }) {
  return (
    <div className={`${styles.historyItem} ${styles[review.action === 'Approved' ? 'approved' : 'returned']}`}>
      <div className={styles.historyHeader}>
        <Badge variant={review.action === 'Approved' ? 'active' : 'overdue'}>
          {review.action === 'Approved' ? 'Approved' : 'Returned for Further Investigation'}
        </Badge>
        <span className={styles.historyMeta}>
          {review.reviewedBy} · {formatDateShort(review.reviewedAt)}
        </span>
      </div>
      {review.comments && (
        <p className={styles.historyComments}>{review.comments}</p>
      )}
    </div>
  );
}

export function ReviewPanel({ investigation }: ReviewPanelProps) {
  const canReview = usePermission('safety_manager');
  const user = useAuthStore((s) => s.user);
  const userName = user?.name ?? 'Unknown User';
  const [reviews, setReviews] = useState<InvestigationReview[]>(investigation.reviews);
  const [status, setStatus] = useState<InvestigationStatus>(investigation.status);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnComment, setReturnComment] = useState('');
  const [returnCommentError, setReturnCommentError] = useState('');

  const isReviewable = REVIEWABLE_STATUSES.includes(status);
  const isApproved = status === 'Approved';

  function submitApproval() {
    const newReview: InvestigationReview = {
      id: crypto.randomUUID(),
      action: 'Approved',
      reviewedBy: userName,
      reviewedAt: new Date().toISOString(),
      comments: '',
    };
    setReviews((prev) => [...prev, newReview]);
    setStatus('Approved');
    setApproveModalOpen(false);
  }

  function submitReturn() {
    if (!returnComment.trim()) {
      setReturnCommentError('Comments are required when returning an investigation.');
      return;
    }
    const newReview: InvestigationReview = {
      id: crypto.randomUUID(),
      action: 'Returned',
      reviewedBy: userName,
      reviewedAt: new Date().toISOString(),
      comments: returnComment.trim(),
    };
    setReviews((prev) => [...prev, newReview]);
    setStatus('Returned');
    setReturnComment('');
    setReturnCommentError('');
    setReturnModalOpen(false);
  }

  function handleReturnClose() {
    setReturnComment('');
    setReturnCommentError('');
    setReturnModalOpen(false);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3 className={styles.title}>Safety Manager Review</h3>
          <p className={styles.subtitle}>
            Only Safety Managers can approve or return investigations.
          </p>
        </div>
      </div>

      {/* Action area */}
      {canReview && (
        <div className={styles.actionArea}>
          {isApproved ? (
            <div className={styles.approvedState}>
              <Badge variant="active">Investigation Approved</Badge>
              <p className={styles.approvedNote}>
                This investigation has been approved. Proceed with CAPA creation.
              </p>
            </div>
          ) : isReviewable ? (
            <div className={styles.actions}>
              <p className={styles.actionPrompt}>
                Review the 5-Why analysis, contributing factors, and witness statements before acting.
              </p>
              <div className={styles.actionButtons}>
                <Button variant="accent" onClick={() => setApproveModalOpen(true)}>
                  Approve Investigation
                </Button>
                <Button variant="secondary" onClick={() => setReturnModalOpen(true)}>
                  Return for Further Investigation
                </Button>
              </div>
            </div>
          ) : (
            <p className={styles.notReviewable}>
              Investigation must be in <strong>Complete</strong> or <strong>In Progress</strong> status to be reviewed.
            </p>
          )}
        </div>
      )}

      {!canReview && !isApproved && (
        <div className={styles.accessNote}>
          Only Safety Managers can approve or return investigations.
        </div>
      )}

      {/* Review history */}
      {reviews.length > 0 && (
        <div className={styles.history}>
          <h4 className={styles.historyTitle}>Review History</h4>
          <div className={styles.historyList}>
            {[...reviews].reverse().map((review) => (
              <ReviewHistoryItem key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 && (
        <p className={styles.noHistory}>No review actions have been taken yet.</p>
      )}

      {/* Approve confirmation modal */}
      <Modal open={approveModalOpen} onClose={() => setApproveModalOpen(false)} title="Approve Investigation" size="sm">
        <div className={styles.confirmModal}>
          <p className={styles.confirmText}>
            Are you sure you want to approve this investigation? This will mark it as complete and
            prompt CAPA creation.
          </p>
          <div className={styles.confirmActions}>
            <Button variant="secondary" onClick={() => setApproveModalOpen(false)}>Cancel</Button>
            <Button variant="accent" onClick={submitApproval}>Confirm Approval</Button>
          </div>
        </div>
      </Modal>

      {/* Return modal */}
      <Modal open={returnModalOpen} onClose={handleReturnClose} title="Return for Further Investigation" size="md">
        <div className={styles.returnModal}>
          <p className={styles.returnPrompt}>
            Explain what additional work is required before this investigation can be approved.
          </p>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="return-comment">
              Comments <span className={styles.required}>*</span>
            </label>
            <textarea
              id="return-comment"
              className="lyon-input"
              rows={5}
              placeholder="Describe what needs to be addressed…"
              value={returnComment}
              onChange={(e) => {
                setReturnComment(e.target.value);
                if (returnCommentError) setReturnCommentError('');
              }}
            />
            {returnCommentError && (
              <span className={styles.fieldError}>{returnCommentError}</span>
            )}
          </div>
          <div className={styles.returnActions}>
            <Button variant="secondary" onClick={handleReturnClose}>Cancel</Button>
            <Button variant="accent" onClick={submitReturn}>Return Investigation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
