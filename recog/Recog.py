import cv2
import pytesseract

# Set up the video capture (0 for default camera, or provide a video file path)
cap = cv2.VideoCapture(0)

# Set up Tesseract OCR
pytesseract.pytesseract.tesseract_cmd = r'/usr/local/Cellar/tesseract/5.3.3/bin/tesseract'  # Update with your Tesseract installation path

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    # Preprocess the frame if needed (resize, crop, etc.)

    # Display the frame
    cv2.imshow('Magic Card OCR', frame)

    # Wait for a key press
    key = cv2.waitKey(1) & 0xFF

    # Check if the 'c' key is pressed to capture an image
    if key == ord('c'):
        # Perform OCR to extract text from the captured frame
        text = pytesseract.image_to_string(frame)

        # Display the extracted text
        print(text)

        # Save the captured frame to a variable or file as needed
        captured_image = frame  # Update this line based on your needs

    # Break the loop if 'q' key is pressed
    elif key == ord('q'):
        break

# Release the video capture object and close all windows
cap.release()
cv2.destroyAllWindows()
