import {useCallback, useEffect, useRef, useState} from 'react'
import {useOutletContext} from "react-router";
import {ImageIcon, UploadIcon} from "lucide-react";
import {
    ALLOWED_UPLOAD_TYPES,
    MAX_UPLOAD_SIZE_BYTES,
    MAX_UPLOAD_SIZE_LABEL,
    PROGRESS_INCREMENT,
    PROGRESS_INTERVAL_MS,
} from "../lib/constants";

type UploadPhase = "idle" | "processing" | "saving";

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [phase, setPhase] = useState<UploadPhase>("idle");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const completionStartedRef = useRef(false);
    const isMountedRef = useRef(false);
    const uploadAttemptRef = useRef(0);

    const { isSignedIn } = useOutletContext<AuthContext>();
    const canUpload = isClient && isSignedIn;

    useEffect(() => {
        isMountedRef.current = true;
        setIsClient(true);

        return () => {
            isMountedRef.current = false;
            uploadAttemptRef.current += 1;

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    const processFile = useCallback((file: File) => {
        if (!canUpload) return;

        if (!ALLOWED_UPLOAD_TYPES.includes(file.type as typeof ALLOWED_UPLOAD_TYPES[number])) {
            setError("Choose a JPEG, PNG, or WebP image.");
            return;
        }

        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
            setError(`Choose an image smaller than ${MAX_UPLOAD_SIZE_LABEL}.`);
            return;
        }

        if (intervalRef.current) clearInterval(intervalRef.current);

        const uploadAttempt = uploadAttemptRef.current + 1;
        uploadAttemptRef.current = uploadAttempt;
        completionStartedRef.current = false;

        setFile(file);
        setProgress(0);
        setError(null);
        setPhase("processing");

        const reader = new FileReader();
        reader.onerror = () => {
            if (!isMountedRef.current || uploadAttemptRef.current !== uploadAttempt) return;

            setFile(null);
            setProgress(0);
            setPhase("idle");
            setError("The selected image could not be read.");
        };
        reader.onload = () => {
            if (!isMountedRef.current || uploadAttemptRef.current !== uploadAttempt) return;

            const base64Data = reader.result as string;
            let nextProgress = 0;

            intervalRef.current = setInterval(() => {
                if (!isMountedRef.current || uploadAttemptRef.current !== uploadAttempt) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    return;
                }

                nextProgress = Math.min(nextProgress + PROGRESS_INCREMENT, 100);
                setProgress(nextProgress);

                if (nextProgress < 100 || completionStartedRef.current) return;

                completionStartedRef.current = true;
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = null;
                setPhase("saving");

                void onComplete(base64Data)
                    .then((wasSaved) => {
                        if (
                            wasSaved ||
                            !isMountedRef.current ||
                            uploadAttemptRef.current !== uploadAttempt
                        ) return;

                        setFile(null);
                        setProgress(0);
                        setPhase("idle");
                        setError("Could not save the project. Please try again.");
                    })
                    .catch(() => {
                        if (!isMountedRef.current || uploadAttemptRef.current !== uploadAttempt) return;

                        setFile(null);
                        setProgress(0);
                        setPhase("idle");
                        setError("Could not save the project. Please try again.");
                    });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(file);
    }, [canUpload, onComplete]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!canUpload) return;
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (!canUpload) return;

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFile(droppedFile);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canUpload) return;

        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={!canUpload}
                        onChange={handleChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {canUpload ? (
                                "Click to upload or just drag and drop"
                            ): ("Sign in or sign up with Puter to upload")}
                        </p>
                        <p className={`help ${error ? "is-error" : ""}`}>
                            {error || `JPEG, PNG, or WebP up to ${MAX_UPLOAD_SIZE_LABEL}.`}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            <ImageIcon className="image" />
                        </div>

                        <h3>{file.name}</h3>

                        <div className='progress'>
                            <div className="bar" style={{ width: `${progress}%` }} />
                        </div>

                        <p className="status-text">
                            {phase === "saving" ? "Saving project..." : "Analyzing Floor Plan..."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Upload
