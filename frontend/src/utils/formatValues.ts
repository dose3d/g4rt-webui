import moment from 'moment';

export function formatDate(value: string | undefined) {
  if (!value) {
    return '';
  }

  return moment(value).format('YYYY-MM-DD HH:mm');
}

export function formatFileSize(size: number) {
  if (size > 1024 * 1024 * 1024) {
    return `${Math.round(size / ((1024.0 * 1024.0 * 1024.0) / 10.0)) / 10.0} GB`;
  } else if (size > 1024 * 1024) {
    return `${Math.round(size / ((1024.0 * 1024.0) / 10.0)) / 10.0} MB`;
  } else if (size > 1024) {
    return `${Math.round(size / (1024.0 / 10.0)) / 10.0} KB`;
  }
  return `${size} B`;
}
