import PhotoUpload from '../features/photo-upload/PhotoUpload';
import SaveInspection from '../features/save-inspection/SaveInspection';
import type { Car } from '../entities/car/model';

export default function PhotoPage(props: { car: Car; photo: File | null; onChange: (file: File | null) => void }) {
  return <div><PhotoUpload {...props} /><SaveInspection car={props.car} photo={props.photo} onSaved={() => props.onChange(null)} /></div>;
}
