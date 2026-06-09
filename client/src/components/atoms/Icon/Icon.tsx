// filename: client/src/components/atoms/Icon/Icon.tsx
import React from 'react';

// Navigation
import { ReactComponent as NavDashboard } from '../../../assets/icons/nav-dashboard.svg';
import { ReactComponent as NavQuiz } from '../../../assets/icons/nav-quiz.svg';
import { ReactComponent as NavInstructor } from '../../../assets/icons/nav-instructor.svg';
import { ReactComponent as NavResults } from '../../../assets/icons/nav-results.svg';
import { ReactComponent as NavFile } from '../../../assets/icons/nav-file.svg';
import { ReactComponent as NavAnalytics } from '../../../assets/icons/nav-analytics.svg';

// Status Badges
import { ReactComponent as StatusDraft } from '../../../assets/icons/status-draft.svg';
import { ReactComponent as StatusScheduled } from '../../../assets/icons/status-scheduled.svg';
import { ReactComponent as StatusLive } from '../../../assets/icons/status-live.svg';
import { ReactComponent as StatusCompleted } from '../../../assets/icons/status-completed.svg';
import { ReactComponent as StatusCancelled } from '../../../assets/icons/status-cancelled.svg';

// UI Icons
import { ReactComponent as AlertCancel } from '../../../assets/icons/alert-cancel.svg';
import { ReactComponent as AlertTriangle } from '../../../assets/icons/alert-triangle.svg';
import { ReactComponent as Analytics } from '../../../assets/icons/analytics.svg';
import { ReactComponent as AnswerCorrect } from '../../../assets/icons/answer-correct.svg';
import { ReactComponent as AnswerWrong } from '../../../assets/icons/answer-wrong.svg';
import { ReactComponent as ArrowLeft } from '../../../assets/icons/arrow-left.svg';
import { ReactComponent as ArrowRight } from '../../../assets/icons/arrow-right.svg';
import { ReactComponent as BellNotification } from '../../../assets/icons/bell-notification.svg';
import { ReactComponent as Calendar } from '../../../assets/icons/calendar.svg';
import { ReactComponent as CheckCircle } from '../../../assets/icons/check-circle.svg';
import { ReactComponent as CheckVerified } from '../../../assets/icons/check-verified.svg';
import { ReactComponent as CheckVerified2 } from '../../../assets/icons/check-verified-2.svg';
import { ReactComponent as Check } from '../../../assets/icons/check.svg';
import { ReactComponent as ChevronDown } from '../../../assets/icons/chevron-down.svg';
import { ReactComponent as ChevronRight } from '../../../assets/icons/chevron-right.svg';
import { ReactComponent as ChipMobile } from '../../../assets/icons/chip-mobile.svg';
import { ReactComponent as ChipQuestions } from '../../../assets/icons/chip-questions.svg';
import { ReactComponent as Copy } from '../../../assets/icons/copy.svg';
import { ReactComponent as CsvUpload } from '../../../assets/icons/csv-upload.svg';
import { ReactComponent as Download } from '../../../assets/icons/download.svg';
import { ReactComponent as EditPencil } from '../../../assets/icons/edit-pencil.svg';
import { ReactComponent as Edit } from '../../../assets/icons/edit.svg';
import { ReactComponent as EmptyState } from '../../../assets/icons/empty-state.svg';
import { ReactComponent as Eye } from '../../../assets/icons/eye.svg';
import { ReactComponent as FeatureParticipants } from '../../../assets/icons/feature-participants.svg';
import { ReactComponent as FeatureQuestions } from '../../../assets/icons/feature-questions.svg';
import { ReactComponent as FileCsv } from '../../../assets/icons/file-csv.svg';
import { ReactComponent as Filter } from '../../../assets/icons/filter.svg';
import { ReactComponent as HelpCircle } from '../../../assets/icons/help-circle.svg';
import { ReactComponent as Lock } from '../../../assets/icons/lock.svg';
import { ReactComponent as Logout } from '../../../assets/icons/logout.svg';
import { ReactComponent as Mail } from '../../../assets/icons/mail.svg';
import { ReactComponent as MessageSquare } from '../../../assets/icons/message-square.svg';
import { ReactComponent as Minus } from '../../../assets/icons/minus.svg';
import { ReactComponent as Monitor } from '../../../assets/icons/monitor.svg';
import { ReactComponent as PaginationNext } from '../../../assets/icons/pagination-next.svg';
import { ReactComponent as PaginationPrev } from '../../../assets/icons/pagination-prev.svg';
import { ReactComponent as Phone } from '../../../assets/icons/phone.svg';
import { ReactComponent as Plus } from '../../../assets/icons/plus.svg';
import { ReactComponent as Publish } from '../../../assets/icons/publish.svg';
import { ReactComponent as QuestionUnanswered } from '../../../assets/icons/question-unanswered.svg';
import { ReactComponent as QuizUpcoming } from '../../../assets/icons/quiz-upcoming.svg';
import { ReactComponent as RadioSelected } from '../../../assets/icons/radio-selected.svg';
import { ReactComponent as RadioUnselected } from '../../../assets/icons/radio-unselected.svg';
import { ReactComponent as Republish } from '../../../assets/icons/republish.svg';
import { ReactComponent as Search } from '../../../assets/icons/search.svg';
import { ReactComponent as SignalWifi } from '../../../assets/icons/signal-wifi.svg';
import { ReactComponent as Sort } from '../../../assets/icons/sort.svg';
import { ReactComponent as StatWarning } from '../../../assets/icons/stat-warning.svg';
import { ReactComponent as Stopwatch } from '../../../assets/icons/stopwatch.svg';
import { ReactComponent as ThemeMoon } from '../../../assets/icons/theme-moon.svg';
import { ReactComponent as ThemeSun } from '../../../assets/icons/theme-sun.svg';
import { ReactComponent as ThemeToggle } from '../../../assets/icons/theme-toggle.svg';
import { ReactComponent as Timer } from '../../../assets/icons/timer.svg';
import { ReactComponent as Trash } from '../../../assets/icons/trash.svg';
import { ReactComponent as Upload } from '../../../assets/icons/upload.svg';
import { ReactComponent as UserGroup } from '../../../assets/icons/user-group.svg';
import { ReactComponent as UserProfile } from '../../../assets/icons/user-profile.svg';
import { ReactComponent as XCancel } from '../../../assets/icons/x-cancel.svg';
import { ReactComponent as XClose } from '../../../assets/icons/x-close.svg';

// Logo
import { ReactComponent as LogoLayers } from '../../../assets/icons/logo-layers.svg';
import { ReactComponent as LogoQa } from '../../../assets/icons/logo-qa.svg';

const iconMap: Record<string, React.FunctionComponent<React.SVGProps<SVGSVGElement>>> = {
  'nav-dashboard': NavDashboard,
  'nav-quiz': NavQuiz,
  'nav-instructor': NavInstructor,
  'nav-results': NavResults,
  'nav-file': NavFile,
  'nav-analytics': NavAnalytics,
  'status-draft': StatusDraft,
  'status-scheduled': StatusScheduled,
  'status-live': StatusLive,
  'status-completed': StatusCompleted,
  'status-cancelled': StatusCancelled,
  'alert-cancel': AlertCancel,
  'alert-triangle': AlertTriangle,
  'analytics': Analytics,
  'answer-correct': AnswerCorrect,
  'answer-wrong': AnswerWrong,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'bell-notification': BellNotification,
  'calendar': Calendar,
  'check-circle': CheckCircle,
  'check-verified': CheckVerified,
  'check-verified-2': CheckVerified2,
  'check': Check,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'chip-mobile': ChipMobile,
  'chip-questions': ChipQuestions,
  'copy': Copy,
  'csv-upload': CsvUpload,
  'download': Download,
  'edit-pencil': EditPencil,
  'edit': Edit,
  'empty-state': EmptyState,
  'eye': Eye,
  'feature-participants': FeatureParticipants,
  'feature-questions': FeatureQuestions,
  'file-csv': FileCsv,
  'filter': Filter,
  'help-circle': HelpCircle,
  'lock': Lock,
  'logout': Logout,
  'mail': Mail,
  'message-square': MessageSquare,
  'minus': Minus,
  'monitor': Monitor,
  'pagination-next': PaginationNext,
  'pagination-prev': PaginationPrev,
  'phone': Phone,
  'plus': Plus,
  'publish': Publish,
  'question-unanswered': QuestionUnanswered,
  'quiz-upcoming': QuizUpcoming,
  'radio-selected': RadioSelected,
  'radio-unselected': RadioUnselected,
  'republish': Republish,
  'search': Search,
  'signal-wifi': SignalWifi,
  'sort': Sort,
  'stat-warning': StatWarning,
  'stopwatch': Stopwatch,
  'theme-moon': ThemeMoon,
  'theme-sun': ThemeSun,
  'theme-toggle': ThemeToggle,
  'timer': Timer,
  'trash': Trash,
  'upload': Upload,
  'user-group': UserGroup,
  'user-profile': UserProfile,
  'x-cancel': XCancel,
  'x-close': XClose,
  'logo-layers': LogoLayers,
  'logo-qa': LogoQa,
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 18, className = '', ...props }) => {
  const SvgComponent = iconMap[name];
  if (!SvgComponent) {
    console.warn(`Icon "${name}" does not exist in iconMap.`);
    return null;
  }
  
  return (
    <SvgComponent 
      width={size} 
      height={size} 
      className={`qa-icon ${className}`} 
      {...props} 
    />
  );
};
export default Icon;
