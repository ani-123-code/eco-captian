# S3 Bucket Policy Configuration

## ⚠️ Error: "The bucket does not allow ACLs"

This error occurs because:
- AWS S3 buckets created after April 2023 have **ACLs disabled by default**
- We were using `acl: 'public-read'` in multer-s3 config
- Modern buckets use **bucket policies** instead of ACLs

## ✅ Solution Applied

1. **Removed ACL from multer-s3 config**
   - Changed from: `acl: 'public-read'`
   - Changed to: No ACL (use bucket policy instead)

2. **Bucket Policy Required**

Your S3 bucket needs a bucket policy to allow public read access for CloudFront.

## 🔧 S3 Bucket Policy Setup

### Step 1: Go to AWS S3 Console
1. Open AWS S3 Console
2. Select your bucket: `ecodispose-images-bucket`
3. Go to **Permissions** tab
4. Scroll to **Bucket policy**

### Step 2: Add Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ecodispose-images-bucket/*"
    }
  ]
}
```

### Step 3: Block Public Access Settings

1. In **Permissions** tab
2. Click **Edit** on **Block public access**
3. **Uncheck** "Block all public access" (or at least uncheck "Block public access to buckets and objects granted through new access control lists (ACLs)")
4. Save changes

### Step 4: Verify CloudFront Access

- CloudFront should be able to access objects
- Objects will be publicly accessible via CloudFront URLs
- Direct S3 URLs may still be blocked (which is fine, we use CloudFront)

## 📝 Alternative: Enable ACLs (Not Recommended)

If you want to use ACLs instead:
1. Go to S3 bucket → **Permissions** → **Object Ownership**
2. Click **Edit**
3. Select **ACLs enabled**
4. Check **Bucket owner preferred**
5. Save

**Note**: This is not recommended. Bucket policies are the modern approach.

## ✅ After Fix

1. **Restart server** (if not already restarted)
2. **Test upload** - should work now
3. **Verify CloudFront URLs** - should load images correctly

## 🔍 Verification

After applying bucket policy:
- Images upload successfully
- CloudFront URLs work
- No more "bucket does not allow ACLs" error
