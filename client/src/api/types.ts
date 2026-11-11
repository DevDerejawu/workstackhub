export interface ApiErrorResponse<ErrorMetadataType> {
  success: false;
  error: {
    message: string;
    code: string;
    status: number;
    metadata: ErrorMetadataType;
  };
}


export interface ApiSuccessResponse<SuccessDataType> {
  success: true;
  message: string;
  data: SuccessDataType;
}