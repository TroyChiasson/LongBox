import cv2
import pytesseract

# Set up the video capture
cap = cv2.VideoCapture(0)

# Set up Tesseract OCR
pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract'  # Update with your path

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    # Define the ROI for the card name
    # These values need to be adjusted based on your specific setup and camera positioning
    x, y, w, h = 300, 0, 400, 100  # Example coordinates
    roi = frame[y:y+h, x:x+w]

    # Convert the ROI to grayscale
    grey_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

    # Optionally, apply further preprocessing to the ROI for better OCR results (e.g., thresholding)

    # Display the ROI (optional)
    cv2.imshow('Card Name ROI', grey_roi)

    # Wait for a key press
    key = cv2.waitKey(1) & 0xFF

    # Check if the 'c' key is pressed to capture the image
    if key == ord('c'):
        # Perform OCR on the grayscale ROI
        text = pytesseract.image_to_string(grey_roi)


        with open("card_scans.txt", "a+") as file:
            file.write(text.split("\n")[0] + "\n")

    # Break the loop if 'q' key is pressed
    elif key == ord('q'):
        break

# Release the video capture object and close all windows
cap.release()
cv2.destroyAllWindows()
