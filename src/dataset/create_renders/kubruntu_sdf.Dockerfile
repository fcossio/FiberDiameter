# to build this image, run
# docker build -f kubruntu_sdf.Dockerfile -t kubruntu_sdf:latest .

FROM kubricdockerhub/kubruntu as kubruntu

# --- install fogleman/sdf
RUN git clone https://github.com/fogleman/sdf.git
RUN pip install ./sdf
