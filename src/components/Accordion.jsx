import {
  Accordion as ChakraAccordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";

const Accordion = ({ sections }) => {
  return (
    <ChakraAccordion allowMultiple>
      {sections.map((section, index) => (
        <AccordionItem
          key={index}
          borderTop={index === 0 ? "none" : "1px solid #E2E8F0"}
        >
          <h2>
            <AccordionButton px={0}>
              <Box
                as="span"
                flex="1"
                textAlign="left"
                className="font-sf font-semibold  py-2  text-base "
                px={0}
              >
                {section.title}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel
            pb={3}
            className="text-sm text-theme-black-2 text-opacity-85"
          >
            {section.content}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </ChakraAccordion>
  );
};

export default Accordion;
