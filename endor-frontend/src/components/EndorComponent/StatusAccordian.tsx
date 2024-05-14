import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import {
  StatusError,
  StatusOK,
  StatusWarning,
} from '@backstage/core-components';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionActions, Button} from '@material-ui/core';

interface StatusAccordionProps {
  title: string;
  count: number;
  explanation: string;
  warningThreshold: number;
  errorThreshold: number;
  link: URL;
}

const StatusAccordion = ({
  title,
  count,
  explanation,
  warningThreshold,
  errorThreshold,
  link,
}: StatusAccordionProps) => {
  let statusElement, actionsElement;

  if (count > errorThreshold) {
    statusElement = (
      <StatusError>
        {title}: {count} Findings
      </StatusError>
    );
  } else if (count > warningThreshold) {
    statusElement = (
      <StatusWarning>
        {title}: {count} Findings
      </StatusWarning>
    );
  } else {
    statusElement = <StatusOK>{title}: Nothing to report</StatusOK>;
  }

  if (count > 0) {
    actionsElement = (
      <AccordionActions>
        <Button href={link.toJSON()} target="_blank">
          Show Me
        </Button>
      </AccordionActions>
    );
  }

  return (
    <Accordion>
      <AccordionSummary
        id={title.toLowerCase().replace(/ /g, '-')}
        expandIcon={<ExpandMoreIcon />}
      >
        {statusElement}
      </AccordionSummary>
      <AccordionDetails>
        {explanation.replace('{count}', count.toString())}
        {actionsElement}
      </AccordionDetails>
    </Accordion>
  );
};

export default StatusAccordion;
