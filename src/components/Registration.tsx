
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { toast } from '@/components/ui/use-toast';

interface RegistrationProps {
  onComplete?: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onComplete }) => {
  const { doctor, registerPatient, sendOTP, verifyOTP } = useApp();
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    
    if (!mobile.trim() || mobile.length < 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid mobile number",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await sendOTP(mobile);
      if (success) {
        setStep('otp');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim() || otp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 4-digit OTP",
        variant: "destructive",
      });
      return;
    }
    
    const isValid = verifyOTP(otp);
    if (isValid) {
      registerPatient(name, mobile);
      if (onComplete) {
        onComplete();
      }
    } else {
      toast({
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await sendOTP(mobile);
      toast({
        title: "OTP Sent",
        description: "A new OTP has been sent to your mobile number.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Registration</CardTitle>
        <CardDescription>
          {step === 'info' 
            ? `Register for an appointment at ${doctor.clinic}`
            : 'Enter the OTP sent to your mobile'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'info' ? (
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor / Clinic</Label>
              <Input id="doctor" value={`${doctor.name} - ${doctor.clinic}`} disabled />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your full name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input 
                id="mobile" 
                placeholder="Enter your mobile number" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value)}
                required
                type="tel"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending OTP..." : "Submit & Get OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input 
                id="otp" 
                placeholder="Enter 4-digit OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                For demo purposes, any 4-digit number will work
              </p>
            </div>
            
            <Button type="submit" className="w-full">
              Verify OTP
            </Button>
            
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={handleResendOtp} 
                disabled={isLoading}
                type="button"
              >
                {isLoading ? "Sending..." : "Resend OTP"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      {step === 'otp' && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => setStep('info')} 
            className="w-full"
            type="button"
          >
            Back
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default Registration;
