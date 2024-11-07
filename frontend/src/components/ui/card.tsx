import * as React from "react";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';

const CustomCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Card ref={ref} className={className} {...props} />
  )
);

CustomCard.displayName = "CustomCard";

const CustomCardHeader = ({ title, subheader }) => (
  <CardHeader title={title} subheader={subheader} />
);

const CustomCardContent = ({ children }) => (
  <CardContent>
    <Typography variant="body2" color="textSecondary" component="div">
      {children}
    </Typography>
  </CardContent>
);

const CustomCardFooter = ({ children }) => (
  <CardActions>
    {children}
  </CardActions>
);

const CardTitle = ({ children }) => (
  <Typography variant="h5" component="h2">
    {children}
  </Typography>
);

const CardDescription = ({ children }) => (
  <Typography variant="body2" color="textSecondary" component="span">
    {children}
  </Typography>
);

export {
  CustomCard as Card,
  CustomCardHeader as CardHeader,
  CustomCardContent as CardContent,
  CustomCardFooter as CardFooter,
  CardTitle,
  CardDescription
};